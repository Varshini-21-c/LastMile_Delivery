package com.delivery.tracker.dto.admin;

import com.delivery.tracker.enums.OrderType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateCardDto {
    private Long id;

    @NotNull(message = "Order type is required")
    private OrderType orderType;

    @NotNull(message = "Intra/Inter Zone flag is required")
    private Boolean isIntraZone;

    @NotNull(message = "Base weight threshold is required")
    @DecimalMin(value = "0.01", message = "Base weight must be > 0")
    private Double baseWeightKg;

    @NotNull(message = "Base rate is required")
    @DecimalMin(value = "0.00", message = "Base rate cannot be negative")
    private BigDecimal baseRate;

    @NotNull(message = "Extra rate per kg is required")
    @DecimalMin(value = "0.00", message = "Extra rate cannot be negative")
    private BigDecimal extraRatePerKg;

    @NotNull(message = "COD fixed surcharge is required")
    @DecimalMin(value = "0.00", message = "COD fixed surcharge cannot be negative")
    private BigDecimal codSurchargeFixed;

    @NotNull(message = "COD percentage surcharge is required")
    @DecimalMin(value = "0.00", message = "COD percent cannot be negative")
    private BigDecimal codSurchargePercent;

    @NotNull(message = "Minimum charge is required")
    @DecimalMin(value = "0.00", message = "Min charge cannot be negative")
    private BigDecimal minCharge;

    private String description;
    private Boolean active;
}
