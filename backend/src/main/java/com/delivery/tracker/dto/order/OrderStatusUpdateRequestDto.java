package com.delivery.tracker.dto.order;

import com.delivery.tracker.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequestDto {
    @NotNull(message = "New status is required")
    private OrderStatus status;

    private String failureReason;
    private String failureNotes;

    private String remarks;
    private Double currentLatitude;
    private Double currentLongitude;
}
