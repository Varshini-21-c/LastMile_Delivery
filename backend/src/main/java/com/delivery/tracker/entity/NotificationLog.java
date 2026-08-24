package com.delivery.tracker.entity;

import com.delivery.tracker.enums.NotificationChannel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private String trackingNumber;

    private String recipientEmail;
    private String recipientPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    private String eventType;
    private String subject;
    @Column(length = 2000)
    private String message;

    private String status;

    @Builder.Default
    private LocalDateTime sentAt = LocalDateTime.now();
}
