package com.delivery.tracker.dto.order;

import com.delivery.tracker.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingHistoryDto {
    private Long id;
    private OrderStatus status;
    private String actorName;
    private String actorRole;
    private String remarks;
    private Double locationLatitude;
    private Double locationLongitude;
    private LocalDateTime timestamp;
}
