package com.delivery.tracker.controller;

import com.delivery.tracker.dto.auth.UserDto;
import com.delivery.tracker.dto.order.OrderResponseDto;
import com.delivery.tracker.dto.order.OrderStatusUpdateRequestDto;
import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.UserRepository;
import com.delivery.tracker.service.AuthService;
import com.delivery.tracker.service.OrderLifecycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ROLE_AGENT') or hasRole('ROLE_ADMIN')")
public class AgentController {

    private final DeliveryOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderLifecycleService orderLifecycleService;
    private final AuthService authService;

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDto>> getAssignedOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User agent = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));

        List<DeliveryOrder> orders = orderRepository.findByAssignedAgentOrderByCreatedAtDesc(agent);
        List<OrderResponseDto> dtos = orders.stream()
                .map(orderLifecycleService::toOrderResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User agent = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));

        if (request.getCurrentLatitude() != null && request.getCurrentLongitude() != null) {
            agent.setCurrentLatitude(request.getCurrentLatitude());
            agent.setCurrentLongitude(request.getCurrentLongitude());
            userRepository.save(agent);
        }

        OrderResponseDto updated = orderLifecycleService.updateOrderStatus(id, request, agent);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/availability")
    public ResponseEntity<UserDto> toggleAvailability(
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        User agent = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));

        Boolean available = body.getOrDefault("isAvailable", true);
        agent.setIsAvailable(available);
        User saved = userRepository.save(agent);

        return ResponseEntity.ok(authService.toUserDto(saved));
    }

    @PatchMapping("/location")
    public ResponseEntity<UserDto> updateLocation(
            @RequestBody Map<String, Double> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        User agent = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Agent not found"));

        Double lat = body.get("latitude");
        Double lng = body.get("longitude");

        if (lat != null && lng != null) {
            agent.setCurrentLatitude(lat);
            agent.setCurrentLongitude(lng);
            User saved = userRepository.save(agent);
            return ResponseEntity.ok(authService.toUserDto(saved));
        }

        return ResponseEntity.badRequest().build();
    }
}
