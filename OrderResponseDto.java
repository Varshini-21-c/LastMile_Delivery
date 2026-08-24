package com.delivery.tracker.dto.order;

import com.delivery.tracker.dto.auth.UserDto;
import com.delivery.tracker.enums.OrderStatus;
import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.enums.PaymentType;
import com.delivery.tracker.enums.RateZoneType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDto {
    private Long id;
    private String trackingNumber;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Boolean createdByAdmin;

    private String senderName;
    private String senderPhone;
    private String pickupAddress;
    private String pickupPincode;
    private String pickupArea;
    private String pickupCity;
    private Long pickupZoneId;
    private String pickupZoneCode;
    private String pickupZoneName;
    private Double pickupLatitude;
    private Double pickupLongitude;

    private String receiverName;
    private String receiverPhone;
    private String dropAddress;
    private String dropPincode;
    private String dropArea;
    private String dropCity;
    private Long dropZoneId;
    private String dropZoneCode;
    private String dropZoneName;
    private Double dropLatitude;
    private Double dropLongitude;

    private Double lengthCm;
    private Double breadthCm;
    private Double heightCm;
    private Double actualWeightKg;
    private Double volumetricWeightKg;
    private Double chargeableWeightKg;

    private OrderType orderType;
    private PaymentType paymentType;
    private RateZoneType rateZoneType;
    private BigDecimal declaredValue;
    private BigDecimal baseRate;
    private BigDecimal extraWeightCharge;
    private BigDecimal codSurcharge;
    private BigDecimal totalAmount;

    private OrderStatus status;
    private UserDto assignedAgent;
    private LocalDateTime assignedAt;

    private String failureReason;
    private String failureNotes;
    private LocalDateTime failedAt;
    private LocalDate rescheduledDate;
    private String rescheduledSlot;
    private String rescheduleReason;
    private Integer rescheduleCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deliveredAt;

    private List<TrackingHistoryDto> trackingHistory;
}
