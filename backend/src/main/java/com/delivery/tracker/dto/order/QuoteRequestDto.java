package com.delivery.tracker.dto.order;

import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.enums.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuoteRequestDto {
    @NotBlank(message = "Pickup pincode is required")
    private String pickupPincode;
    private String pickupArea;
    private String pickupCity;

    @NotBlank(message = "Drop pincode is required")
    private String dropPincode;
    private String dropArea;
    private String dropCity;

    @NotNull(message = "Length is required")
    @DecimalMin(value = "0.1", message = "Length must be greater than 0")
    private Double lengthCm;

    @NotNull(message = "Breadth is required")
    @DecimalMin(value = "0.1", message = "Breadth must be greater than 0")
    private Double breadthCm;

    @NotNull(message = "Height is required")
    @DecimalMin(value = "0.1", message = "Height must be greater than 0")
    private Double heightCm;

    @NotNull(message = "Actual weight is required")
    @DecimalMin(value = "0.01", message = "Actual weight must be greater than 0")
    private Double actualWeightKg;

    @NotNull(message = "Order type is required (B2B or B2C)")
    private OrderType orderType;

    @NotNull(message = "Payment type is required (PREPAID or COD)")
    private PaymentType paymentType;

    private BigDecimal declaredValue;
}
