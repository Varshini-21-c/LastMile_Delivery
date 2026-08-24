package com.delivery.tracker.entity;

import com.delivery.tracker.enums.OrderType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rate_cards", uniqueConstraints = {
    @UniqueConstraint(name = "uk_order_zone_type", columnNames = {"orderType", "isIntraZone"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderType orderType;

    @Column(nullable = false)
    private Boolean isIntraZone;

    @Column(nullable = false)
    private Double baseWeightKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extraRatePerKg;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal codSurchargeFixed;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal codSurchargePercent;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minCharge;

    @Column(length = 255)
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    public boolean matches(OrderType type, boolean intraZone) {
        return this.orderType == type && Boolean.valueOf(intraZone).equals(this.isIntraZone);
    }
}

