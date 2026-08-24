package com.delivery.tracker.controller;

import com.delivery.tracker.dto.admin.AdminDashboardStatsDto;
import com.delivery.tracker.dto.admin.AreaMappingDto;
import com.delivery.tracker.dto.admin.RateCardDto;
import com.delivery.tracker.dto.admin.ZoneDto;
import com.delivery.tracker.dto.auth.UserDto;
import com.delivery.tracker.dto.order.AssignAgentRequestDto;
import com.delivery.tracker.dto.order.OrderResponseDto;
import com.delivery.tracker.dto.order.OrderStatusUpdateRequestDto;
import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.enums.OrderStatus;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.UserRepository;
import com.delivery.tracker.repository.ZoneRepository;
import com.delivery.tracker.service.AuthService;
import com.delivery.tracker.service.OrderLifecycleService;
import com.delivery.tracker.service.RateCardService;
import com.delivery.tracker.service.ZoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final DeliveryOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final OrderLifecycleService orderLifecycleService;
    private final ZoneService zoneService;
    private final RateCardService rateCardService;
    private final AuthService authService;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        long totalOrders = orderRepository.count();
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long failed = orderRepository.countByStatus(OrderStatus.FAILED);
        long rescheduled = orderRepository.countByStatus(OrderStatus.RESCHEDULED);

        long activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.CREATED ||
                             o.getStatus() == OrderStatus.ASSIGNED ||
                             o.getStatus() == OrderStatus.PICKED_UP ||
                             o.getStatus() == OrderStatus.IN_TRANSIT ||
                             o.getStatus() == OrderStatus.OUT_FOR_DELIVERY ||
                             o.getStatus() == OrderStatus.RESCHEDULED)
                .count();

        BigDecimal revenue = orderRepository.sumDeliveredRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        long customers = userRepository.findByRole(Role.ROLE_CUSTOMER).size();
        List<User> agents = userRepository.findByRole(Role.ROLE_AGENT);
        long totalAgents = agents.size();
        long availableAgents = agents.stream().filter(a -> Boolean.TRUE.equals(a.getIsAvailable())).count();
        long totalZones = zoneRepository.count();

        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            ordersByStatus.put(s.name(), orderRepository.countByStatus(s));
        }

        Map<String, Long> ordersByZone = new HashMap<>();
        for (DeliveryOrder o : orderRepository.findAll()) {
            String z = o.getPickupZone() != null ? o.getPickupZone().getName() : "Unassigned";
            ordersByZone.put(z, ordersByZone.getOrDefault(z, 0L) + 1);
        }

        return ResponseEntity.ok(AdminDashboardStatsDto.builder()
                .totalOrders(totalOrders)
                .activeOrders(activeOrders)
                .deliveredOrders(delivered)
                .failedOrders(failed)
                .rescheduledOrders(rescheduled)
                .totalDeliveredRevenue(revenue)
                .totalCustomers(customers)
                .totalAgents(totalAgents)
                .availableAgents(availableAgents)
                .totalZones(totalZones)
                .ordersByStatus(ordersByStatus)
                .ordersByZone(ordersByZone)
                .build());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) String search) {

        List<DeliveryOrder> orders = orderRepository.findAllByOrderByCreatedAtDesc();

        if (status != null) {
            orders = orders.stream().filter(o -> o.getStatus() == status).collect(Collectors.toList());
        }
        if (zoneId != null) {
            orders = orders.stream().filter(o -> (o.getPickupZone() != null && o.getPickupZone().getId().equals(zoneId)) ||
                                                 (o.getDropZone() != null && o.getDropZone().getId().equals(zoneId)))
                    .collect(Collectors.toList());
        }
        if (agentId != null) {
            orders = orders.stream().filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(agentId))
                    .collect(Collectors.toList());
        }
        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            orders = orders.stream().filter(o ->
                    o.getTrackingNumber().toLowerCase().contains(q) ||
                    (o.getReceiverName() != null && o.getReceiverName().toLowerCase().contains(q)) ||
                    (o.getSenderName() != null && o.getSenderName().toLowerCase().contains(q)) ||
                    (o.getPickupAddress() != null && o.getPickupAddress().toLowerCase().contains(q)) ||
                    (o.getDropAddress() != null && o.getDropAddress().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        List<OrderResponseDto> dtos = orders.stream()
                .map(orderLifecycleService::toOrderResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/orders/{id}/assign")
    public ResponseEntity<OrderResponseDto> assignAgent(
            @PathVariable Long id,
            @RequestBody AssignAgentRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        if (Boolean.TRUE.equals(request.getAutoAssign()) || request.getAgentId() == null) {
            return ResponseEntity.ok(orderLifecycleService.triggerAutoAssignment(id, admin));
        }

        return ResponseEntity.ok(orderLifecycleService.assignAgentToOrder(id, request.getAgentId(), request.getRemarks(), admin));
    }

    @PatchMapping("/orders/{id}/override-status")
    public ResponseEntity<OrderResponseDto> overrideStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User admin = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        return ResponseEntity.ok(orderLifecycleService.updateOrderStatus(id, request, admin));
    }

    @GetMapping("/zones")
    public ResponseEntity<List<ZoneDto>> getZones() {
        return ResponseEntity.ok(zoneService.getAllZones());
    }

    @PostMapping("/zones")
    public ResponseEntity<ZoneDto> createZone(@Valid @RequestBody ZoneDto dto) {
        return ResponseEntity.ok(zoneService.createZone(dto));
    }

    @PutMapping("/zones/{id}")
    public ResponseEntity<ZoneDto> updateZone(@PathVariable Long id, @Valid @RequestBody ZoneDto dto) {
        return ResponseEntity.ok(zoneService.updateZone(id, dto));
    }

    @DeleteMapping("/zones/{id}")
    public ResponseEntity<Void> deleteZone(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/areas")
    public ResponseEntity<List<AreaMappingDto>> getAreaMappings() {
        return ResponseEntity.ok(zoneService.getAllAreaMappings());
    }

    @PostMapping("/areas")
    public ResponseEntity<AreaMappingDto> createAreaMapping(@Valid @RequestBody AreaMappingDto dto) {
        return ResponseEntity.ok(zoneService.createAreaMapping(dto));
    }

    @PutMapping("/areas/{id}")
    public ResponseEntity<AreaMappingDto> updateAreaMapping(@PathVariable Long id, @Valid @RequestBody AreaMappingDto dto) {
        return ResponseEntity.ok(zoneService.updateAreaMapping(id, dto));
    }

    @DeleteMapping("/areas/{id}")
    public ResponseEntity<Void> deleteAreaMapping(@PathVariable Long id) {
        zoneService.deleteAreaMapping(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rate-cards")
    public ResponseEntity<List<RateCardDto>> getRateCards() {
        return ResponseEntity.ok(rateCardService.getAllRateCards());
    }

    @PostMapping("/rate-cards")
    public ResponseEntity<RateCardDto> createRateCard(@Valid @RequestBody RateCardDto dto) {
        return ResponseEntity.ok(rateCardService.createRateCard(dto));
    }

    @PutMapping("/rate-cards/{id}")
    public ResponseEntity<RateCardDto> updateRateCard(@PathVariable Long id, @Valid @RequestBody RateCardDto dto) {
        return ResponseEntity.ok(rateCardService.updateRateCard(id, dto));
    }

    @DeleteMapping("/rate-cards/{id}")
    public ResponseEntity<Void> deleteRateCard(@PathVariable Long id) {
        rateCardService.deleteRateCard(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/agents")
    public ResponseEntity<List<UserDto>> getAgents() {
        List<UserDto> list = userRepository.findByRole(Role.ROLE_AGENT).stream()
                .map(authService::toUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/customers")
    public ResponseEntity<List<UserDto>> getCustomers() {
        List<UserDto> list = userRepository.findByRole(Role.ROLE_CUSTOMER).stream()
                .map(authService::toUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
