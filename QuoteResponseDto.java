package com.delivery.tracker.dto.order;

import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.enums.PaymentType;
import com.delivery.tracker.enums.RateZoneType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponseDto {
    private String pickupPincode;
    private String pickupZoneCode;
    private String pickupZoneName;

    private String dropPincode;
    private String dropZoneCode;
    private String dropZoneName;

    private RateZoneType rateZoneType;
    private Boolean isIntraZone;

    private Double lengthCm;
    private Double breadthCm;
    private Double heightCm;

    private Double actualWeightKg;
    private Double volumetricWeightKg;
    private Double chargeableWeightKg;
    private String billedOnReason;

    private OrderType orderType;
    private PaymentType paymentType;

    private BigDecimal baseWeightKg;
    private BigDecimal baseRate;
    private BigDecimal extraWeightCharge;
    private BigDecimal codSurcharge;
    private BigDecimal totalAmount;

    private String rateCardDescription;
}
