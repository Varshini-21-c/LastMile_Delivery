package com.delivery.tracker.dto.order;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RescheduleRequestDto {
    @NotNull(message = "Reschedule date is required")
    @FutureOrPresent(message = "Reschedule date must be today or in the future")
    private LocalDate rescheduledDate;

    @NotBlank(message = "Delivery time slot is required")
    private String rescheduledSlot;

    private String rescheduleReason;
}
