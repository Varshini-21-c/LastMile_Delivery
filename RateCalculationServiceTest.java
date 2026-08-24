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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RateCalculationServiceTest {

    @Mock
    private AreaPincodeMappingRepository areaPincodeMappingRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private RateCardRepository rateCardRepository;

    @InjectMocks
    private RateCalculationService rateCalculationService;

    private Zone southZone;
    private Zone northZone;
    private RateCard b2cIntraCard;
    private RateCard b2cInterCard;
    private RateCard b2bInterCard;

    @BeforeEach
    void setUp() {
        southZone = Zone.builder().id(1L).code("SOUTH_ZONE").name("South Hub").build();
        northZone = Zone.builder().id(2L).code("NORTH_ZONE").name("North Hub").build();

        b2cIntraCard = RateCard.builder()
                .id(1L)
                .orderType(OrderType.B2C)
                .isIntraZone(true)
                .baseWeightKg(0.5)
                .baseRate(BigDecimal.valueOf(40.00))
                .extraRatePerKg(BigDecimal.valueOf(20.00))
                .codSurchargeFixed(BigDecimal.valueOf(25.00))
                .codSurchargePercent(BigDecimal.valueOf(1.50))
                .minCharge(BigDecimal.valueOf(40.00))
                .active(true)
                .build();

        b2cInterCard = RateCard.builder()
                .id(2L)
                .orderType(OrderType.B2C)
                .isIntraZone(false)
                .baseWeightKg(0.5)
                .baseRate(BigDecimal.valueOf(75.00))
                .extraRatePerKg(BigDecimal.valueOf(35.00))
                .codSurchargeFixed(BigDecimal.valueOf(30.00))
                .codSurchargePercent(BigDecimal.valueOf(2.00))
                .minCharge(BigDecimal.valueOf(75.00))
                .active(true)
                .build();

        b2bInterCard = RateCard.builder()
                .id(3L)
                .orderType(OrderType.B2B)
                .isIntraZone(false)
                .baseWeightKg(5.0)
                .baseRate(BigDecimal.valueOf(320.00))
                .extraRatePerKg(BigDecimal.valueOf(25.00))
                .codSurchargeFixed(BigDecimal.valueOf(60.00))
                .codSurchargePercent(BigDecimal.valueOf(1.20))
                .minCharge(BigDecimal.valueOf(320.00))
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Volumetric Weight calculation formula (L*B*H)/5000")
    void testVolumetricWeightCalculation() {

        double volWeight = rateCalculationService.calculateVolumetricWeight(50, 40, 30);
        assertEquals(12.0, volWeight, 0.001);
    }

    @Test
    @DisplayName("B2C Intra-Zone: Actual weight > Volumetric weight with Prepaid")
    void testB2CIntraZoneActualWeightHigher() {
        when(areaPincodeMappingRepository.findByPincode("560034"))
                .thenReturn(Optional.of(AreaPincodeMapping.builder().pincode("560034").zone(southZone).build()));
        when(areaPincodeMappingRepository.findByPincode("560102"))
                .thenReturn(Optional.of(AreaPincodeMapping.builder().pincode("560102").zone(southZone).build()));
        when(rateCardRepository.findByOrderTypeAndIsIntraZoneAndActiveTrue(OrderType.B2C, true))
                .thenReturn(Optional.of(b2cIntraCard));

        QuoteRequestDto req = new QuoteRequestDto();
        req.setPickupPincode("560034");
        req.setDropPincode("560102");
        req.setLengthCm(20.0);
        req.setBreadthCm(15.0);
        req.setHeightCm(10.0);
        req.setActualWeightKg(1.5);
        req.setOrderType(OrderType.B2C);
        req.setPaymentType(PaymentType.PREPAID);

        QuoteResponseDto quote = rateCalculationService.calculateQuote(req);

        assertEquals(RateZoneType.INTRA_ZONE, quote.getRateZoneType());
        assertEquals(1.5, quote.getChargeableWeightKg());

        assertEquals(0, BigDecimal.valueOf(60.00).compareTo(quote.getTotalAmount()));
        assertEquals(0, BigDecimal.valueOf(0.00).compareTo(quote.getCodSurcharge()));
    }

    @Test
    @DisplayName("B2C Inter-Zone: Volumetric weight > Actual weight with COD Surcharge")
    void testB2CInterZoneVolumetricHigherWithCOD() {
        when(areaPincodeMappingRepository.findByPincode("560034"))
                .thenReturn(Optional.of(AreaPincodeMapping.builder().pincode("560034").zone(southZone).build()));
        when(areaPincodeMappingRepository.findByPincode("560024"))
                .thenReturn(Optional.of(AreaPincodeMapping.builder().pincode("560024").zone(northZone).build()));
        when(rateCardRepository.findByOrderTypeAndIsIntraZoneAndActiveTrue(OrderType.B2C, false))
                .thenReturn(Optional.of(b2cInterCard));

        QuoteRequestDto req = new QuoteRequestDto();
        req.setPickupPincode("560034");
        req.setDropPincode("560024");
        req.setLengthCm(40.0);
        req.setBreadthCm(30.0);
        req.setHeightCm(25.0);
        req.setActualWeightKg(2.0);
        req.setOrderType(OrderType.B2C);
        req.setPaymentType(PaymentType.COD);
        req.setDeclaredValue(BigDecimal.valueOf(2000.00));

        QuoteResponseDto quote = rateCalculationService.calculateQuote(req);

        assertEquals(RateZoneType.INTER_ZONE, quote.getRateZoneType());
        assertEquals(6.0, quote.getChargeableWeightKg());

        assertEquals(0, BigDecimal.valueOf(337.50).compareTo(quote.getTotalAmount()));
        assertEquals(0, BigDecimal.valueOf(70.00).compareTo(quote.getCodSurcharge()));
    }

    @Test
    @DisplayName("B2B Cross-Zone: Heavy bulk shipment pricing with COD")
    void testB2BCrossZonePricing() {
        when(areaPincodeMappingRepository.findByPincode("560066"))
                .thenReturn(Optional.of(AreaPincodeMapping.builder().pincode("560066").zone(southZone).build()));
        when(areaPincodeMappingRepository.findByPincode("560058"))
                .thenReturn(Optional.of(AreaPincodeMapping.builder().pincode("560058").zone(northZone).build()));
        when(rateCardRepository.findByOrderTypeAndIsIntraZoneAndActiveTrue(OrderType.B2B, false))
                .thenReturn(Optional.of(b2bInterCard));

        QuoteRequestDto req = new QuoteRequestDto();
        req.setPickupPincode("560066");
        req.setDropPincode("560058");
        req.setLengthCm(50.0);
        req.setBreadthCm(40.0);
        req.setHeightCm(30.0);
        req.setActualWeightKg(15.0);
        req.setOrderType(OrderType.B2B);
        req.setPaymentType(PaymentType.COD);
        req.setDeclaredValue(BigDecimal.valueOf(10000.00));

        QuoteResponseDto quote = rateCalculationService.calculateQuote(req);

        assertEquals(15.0, quote.getChargeableWeightKg());

        assertEquals(0, BigDecimal.valueOf(750.00).compareTo(quote.getTotalAmount()));
    }
}
