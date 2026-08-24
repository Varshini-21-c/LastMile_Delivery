package com.delivery.tracker.controller;

import com.delivery.tracker.dto.order.OrderResponseDto;
import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.service.OrderLifecycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrackingController {

    private final DeliveryOrderRepository orderRepository;
    private final OrderLifecycleService orderLifecycleService;

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<OrderResponseDto> trackOrder(@PathVariable String trackingNumber) {
        DeliveryOrder order = orderRepository.findByTrackingNumber(trackingNumber.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("No shipment found with tracking number: " + trackingNumber));

        return ResponseEntity.ok(orderLifecycleService.toOrderResponseDto(order));
    }
}
