package com.delivery.tracker.service;

import com.delivery.tracker.dto.order.QuoteRequestDto;
import com.delivery.tracker.dto.order.QuoteResponseDto;
import com.delivery.tracker.entity.AreaPincodeMapping;
import com.delivery.tracker.entity.RateCard;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.enums.PaymentType;
import com.delivery.tracker.enums.RateZoneType;
import com.delivery.tracker.repository.AreaPincodeMappingRepository;
import com.delivery.tracker.repository.RateCardRepository;
import com.delivery.tracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateCalculationService {

    public static final double VOLUMETRIC_DIVISOR = 5000.0;

    private final AreaPincodeMappingRepository areaPincodeMappingRepository;
    private final ZoneRepository zoneRepository;
    private final RateCardRepository rateCardRepository;

    public Zone detectZone(String pincode, String areaName) {
        if (pincode != null && !pincode.trim().isEmpty()) {
            Optional<AreaPincodeMapping> mapping = areaPincodeMappingRepository.findByPincode(pincode.trim());
            if (mapping.isPresent() && mapping.get().getZone() != null) {
                return mapping.get().getZone();
            }
        }

        if (areaName != null && !areaName.trim().isEmpty()) {
            Optional<AreaPincodeMapping> mapping = areaPincodeMappingRepository.findFirstByAreaNameIgnoreCase(areaName.trim());
            if (mapping.isPresent() && mapping.get().getZone() != null) {
                return mapping.get().getZone();
            }
        }

        log.debug("Zone not found for PIN: '{}', Area: '{}'. Falling back to central hub.", pincode, areaName);
        return zoneRepository.findByCode("CENTRAL_ZONE")
                .or(() -> zoneRepository.findAll().stream().findFirst())
                .orElse(null);
    }

    public double calculateVolumetricWeight(double lengthCm, double breadthCm, double heightCm) {
        if (lengthCm <= 0 || breadthCm <= 0 || heightCm <= 0) {
            return 0.0;
        }
        double vol = (lengthCm * breadthCm * heightCm) / VOLUMETRIC_DIVISOR;
        return roundToTwoDecimals(vol);
    }

    public QuoteResponseDto calculateQuote(QuoteRequestDto request) {

        Zone pickupZone = detectZone(request.getPickupPincode(), request.getPickupArea());
        Zone dropZone = detectZone(request.getDropPincode(), request.getDropArea());

        boolean isIntraZone = false;
        if (pickupZone != null && dropZone != null) {
            isIntraZone = pickupZone.getId().equals(dropZone.getId()) ||
                          pickupZone.getCode().equalsIgnoreCase(dropZone.getCode());
        }

        RateZoneType rateZoneType = isIntraZone ? RateZoneType.INTRA_ZONE : RateZoneType.INTER_ZONE;
        final boolean isIntraZoneFinal = isIntraZone;

        double volumetricWeight = calculateVolumetricWeight(
                request.getLengthCm(),
                request.getBreadthCm(),
                request.getHeightCm()
        );
        double actualWeight = roundToTwoDecimals(request.getActualWeightKg());
        double chargeableWeight = Math.max(actualWeight, volumetricWeight);

        String billedReason = volumetricWeight > actualWeight
                ? String.format("Volumetric Weight (%.2f kg > %.2f kg Actual scale weight)", volumetricWeight, actualWeight)
                : String.format("Actual Scale Weight (%.2f kg >= %.2f kg Volumetric)", actualWeight, volumetricWeight);

        final OrderType orderType = request.getOrderType() != null ? request.getOrderType() : OrderType.B2C;
        PaymentType paymentType = request.getPaymentType() != null ? request.getPaymentType() : PaymentType.PREPAID;

        RateCard rateCard = rateCardRepository.findByOrderTypeAndIsIntraZoneAndActiveTrue(orderType, isIntraZoneFinal)
                .orElseGet(() -> getDefaultFallbackRateCard(orderType, isIntraZoneFinal));

        BigDecimal baseRate = rateCard.getBaseRate();
        double baseWeightLimit = rateCard.getBaseWeightKg();
        BigDecimal extraRatePerKg = rateCard.getExtraRatePerKg();

        double extraWeight = Math.max(0.0, chargeableWeight - baseWeightLimit);
        BigDecimal extraWeightCharge = extraRatePerKg.multiply(BigDecimal.valueOf(extraWeight))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal codSurcharge = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (paymentType == PaymentType.COD) {
            BigDecimal fixedFee = rateCard.getCodSurchargeFixed() != null ? rateCard.getCodSurchargeFixed() : BigDecimal.ZERO;
            BigDecimal percentFee = BigDecimal.ZERO;

            if (request.getDeclaredValue() != null && request.getDeclaredValue().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percent = rateCard.getCodSurchargePercent() != null ? rateCard.getCodSurchargePercent() : BigDecimal.ZERO;
                percentFee = request.getDeclaredValue().multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            codSurcharge = fixedFee.add(percentFee).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal subTotal = baseRate.add(extraWeightCharge).add(codSurcharge);
        BigDecimal minCharge = rateCard.getMinCharge() != null ? rateCard.getMinCharge() : BigDecimal.ZERO;
        BigDecimal totalAmount = subTotal.max(minCharge).setScale(2, RoundingMode.HALF_UP);

        return QuoteResponseDto.builder()
                .pickupPincode(request.getPickupPincode())
                .pickupZoneCode(pickupZone != null ? pickupZone.getCode() : "UNKNOWN")
                .pickupZoneName(pickupZone != null ? pickupZone.getName() : "Unassigned Zone")
                .dropPincode(request.getDropPincode())
                .dropZoneCode(dropZone != null ? dropZone.getCode() : "UNKNOWN")
                .dropZoneName(dropZone != null ? dropZone.getName() : "Unassigned Zone")
                .rateZoneType(rateZoneType)
                .isIntraZone(isIntraZone)
                .lengthCm(request.getLengthCm())
                .breadthCm(request.getBreadthCm())
                .heightCm(request.getHeightCm())
                .actualWeightKg(actualWeight)
                .volumetricWeightKg(volumetricWeight)
                .chargeableWeightKg(chargeableWeight)
                .billedOnReason(billedReason)
                .orderType(orderType)
                .paymentType(paymentType)
                .baseWeightKg(BigDecimal.valueOf(baseWeightLimit))
                .baseRate(baseRate)
                .extraWeightCharge(extraWeightCharge)
                .codSurcharge(codSurcharge)
                .totalAmount(totalAmount)
                .rateCardDescription(rateCard.getDescription())
                .build();
    }

    private RateCard getDefaultFallbackRateCard(OrderType orderType, boolean isIntraZone) {
        log.warn("Using in-memory fallback rate card for {} (IntraZone: {})", orderType, isIntraZone);
        return RateCard.builder()
                .orderType(orderType)
                .isIntraZone(isIntraZone)
                .baseWeightKg(orderType == OrderType.B2B ? 5.0 : 0.5)
                .baseRate(orderType == OrderType.B2B ? (isIntraZone ? BigDecimal.valueOf(180) : BigDecimal.valueOf(320))
                                                    : (isIntraZone ? BigDecimal.valueOf(40) : BigDecimal.valueOf(75)))
                .extraRatePerKg(orderType == OrderType.B2B ? (isIntraZone ? BigDecimal.valueOf(15) : BigDecimal.valueOf(25))
                                                           : (isIntraZone ? BigDecimal.valueOf(20) : BigDecimal.valueOf(35)))
                .codSurchargeFixed(BigDecimal.valueOf(25.00))
                .codSurchargePercent(BigDecimal.valueOf(1.50))
                .minCharge(orderType == OrderType.B2B ? BigDecimal.valueOf(180) : BigDecimal.valueOf(40))
                .description("Standard Logistics Rate Card")
                .active(true)
                .build();
    }

    private double roundToTwoDecimals(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
