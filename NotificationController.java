package com.delivery.tracker.controller;

import com.delivery.tracker.entity.NotificationLog;
import com.delivery.tracker.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/order/{trackingNumber}")
    public ResponseEntity<List<NotificationLog>> getOrderNotifications(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(notificationService.getNotificationsByTrackingNumber(trackingNumber));
    }

    @GetMapping("/all")
    public ResponseEntity<List<NotificationLog>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }
}
