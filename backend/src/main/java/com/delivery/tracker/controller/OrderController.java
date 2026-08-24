package com.delivery.tracker.controller;

import com.delivery.tracker.dto.order.CreateOrderRequestDto;
import com.delivery.tracker.dto.order.OrderResponseDto;
import com.delivery.tracker.dto.order.RescheduleRequestDto;
import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.UserRepository;
import com.delivery.tracker.service.OrderLifecycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderLifecycleService orderLifecycleService;
    private final DeliveryOrderRepository orderRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @Valid @RequestBody CreateOrderRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        OrderResponseDto response = orderLifecycleService.createOrder(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<DeliveryOrder> orders;
        if (user.getRole() == Role.ROLE_ADMIN) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        } else if (user.getRole() == Role.ROLE_AGENT) {
            orders = orderRepository.findByAssignedAgentOrderByCreatedAtDesc(user);
        } else {
            orders = orderRepository.findByCustomerOrderByCreatedAtDesc(user);
        }

        List<OrderResponseDto> dtos = orders.stream()
                .map(orderLifecycleService::toOrderResponseDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        DeliveryOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + id));

        return ResponseEntity.ok(orderLifecycleService.toOrderResponseDto(order));
    }

    @PostMapping("/{id}/reschedule")
    public ResponseEntity<OrderResponseDto> rescheduleOrder(
            @PathVariable Long id,
            @Valid @RequestBody RescheduleRequestDto request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        OrderResponseDto response = orderLifecycleService.rescheduleOrder(id, request, user);
        return ResponseEntity.ok(response);
    }
}
