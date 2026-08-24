package com.delivery.tracker.config;

import com.delivery.tracker.dto.order.CreateOrderRequestDto;
import com.delivery.tracker.entity.AreaPincodeMapping;
import com.delivery.tracker.entity.RateCard;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.OrderStatus;
import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.enums.PaymentType;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.AreaPincodeMappingRepository;
import com.delivery.tracker.repository.RateCardRepository;
import com.delivery.tracker.repository.UserRepository;
import com.delivery.tracker.repository.ZoneRepository;
import com.delivery.tracker.service.OrderLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final AreaPincodeMappingRepository areaPincodeMappingRepository;
    private final RateCardRepository rateCardRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderLifecycleService orderLifecycleService;

    @Override
    public void run(String... args) {
        if (zoneRepository.count() == 0) {
            log.info("Initializing Seed Data for Last-Mile Delivery Tracker Platform...");
            seedZonesAndAreas();
            seedRateCards();
            seedUsers();
            seedSampleOrders();
            log.info("Seed Data Initialization Completed Successfully!");
        }
    }

    private void seedZonesAndAreas() {

        Zone north = zoneRepository.save(Zone.builder()
                .code("NORTH_ZONE")
                .name("North Metro Hub")
                .description("Covers Hebbal, Yelahanka, Vidyaranyapura, and Sahakarnagar")
                .centerLatitude(13.0358)
                .centerLongitude(77.5970)
                .active(true)
                .build());

        Zone south = zoneRepository.save(Zone.builder()
                .code("SOUTH_ZONE")
                .name("South Metro Hub")
                .description("Covers Koramangala, HSR Layout, Jayanagar, BTM, and JP Nagar")
                .centerLatitude(12.9165)
                .centerLongitude(77.6101)
                .active(true)
                .build());

        Zone east = zoneRepository.save(Zone.builder()
                .code("EAST_ZONE")
                .name("East Tech Corridor")
                .description("Covers Whitefield, Marathahalli, Bellandur, and KR Puram")
                .centerLatitude(12.9698)
                .centerLongitude(77.7500)
                .active(true)
                .build());

        Zone west = zoneRepository.save(Zone.builder()
                .code("WEST_ZONE")
                .name("West Industrial Hub")
                .description("Covers Rajajinagar, Peenya Industrial Area, and Malleshwaram")
                .centerLatitude(12.9982)
                .centerLongitude(77.5530)
                .active(true)
                .build());

        Zone central = zoneRepository.save(Zone.builder()
                .code("CENTRAL_ZONE")
                .name("Central Business District")
                .description("Covers MG Road, Indiranagar, Brigade Road, and Richmond Town")
                .centerLatitude(12.9716)
                .centerLongitude(77.5946)
                .active(true)
                .build());

        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560001").areaName("MG Road / Brigade Road").city("Bengaluru").state("Karnataka").zone(central).latitude(12.9738).longitude(77.6119).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560038").areaName("Indiranagar").city("Bengaluru").state("Karnataka").zone(central).latitude(12.9784).longitude(77.6408).build());

        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560034").areaName("Koramangala").city("Bengaluru").state("Karnataka").zone(south).latitude(12.9352).longitude(77.6245).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560102").areaName("HSR Layout").city("Bengaluru").state("Karnataka").zone(south).latitude(12.9121).longitude(77.6446).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560041").areaName("Jayanagar").city("Bengaluru").state("Karnataka").zone(south).latitude(12.9308).longitude(77.5838).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560076").areaName("BTM Layout").city("Bengaluru").state("Karnataka").zone(south).latitude(12.9166).longitude(77.6101).build());

        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560066").areaName("Whitefield").city("Bengaluru").state("Karnataka").zone(east).latitude(12.9698).longitude(77.7500).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560037").areaName("Marathahalli").city("Bengaluru").state("Karnataka").zone(east).latitude(12.9591).longitude(77.6974).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560103").areaName("Bellandur").city("Bengaluru").state("Karnataka").zone(east).latitude(12.9304).longitude(77.6784).build());

        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560024").areaName("Hebbal").city("Bengaluru").state("Karnataka").zone(north).latitude(13.0358).longitude(77.5970).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560064").areaName("Yelahanka").city("Bengaluru").state("Karnataka").zone(north).latitude(13.1007).longitude(77.5963).build());

        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560010").areaName("Rajajinagar").city("Bengaluru").state("Karnataka").zone(west).latitude(12.9982).longitude(77.5530).build());
        areaPincodeMappingRepository.save(AreaPincodeMapping.builder().pincode("560058").areaName("Peenya Industrial Area").city("Bengaluru").state("Karnataka").zone(west).latitude(13.0285).longitude(77.5197).build());
    }

    private void seedRateCards() {

        rateCardRepository.save(RateCard.builder()
                .orderType(OrderType.B2C)
                .isIntraZone(true)
                .baseWeightKg(0.5)
                .baseRate(BigDecimal.valueOf(40.00))
                .extraRatePerKg(BigDecimal.valueOf(20.00))
                .codSurchargeFixed(BigDecimal.valueOf(25.00))
                .codSurchargePercent(BigDecimal.valueOf(1.50))
                .minCharge(BigDecimal.valueOf(40.00))
                .description("Standard B2C Local Intra-Zone (Up to 0.5 kg @ ₹40, +₹20/kg)")
                .active(true)
                .build());

        rateCardRepository.save(RateCard.builder()
                .orderType(OrderType.B2C)
                .isIntraZone(false)
                .baseWeightKg(0.5)
                .baseRate(BigDecimal.valueOf(75.00))
                .extraRatePerKg(BigDecimal.valueOf(35.00))
                .codSurchargeFixed(BigDecimal.valueOf(30.00))
                .codSurchargePercent(BigDecimal.valueOf(2.00))
                .minCharge(BigDecimal.valueOf(75.00))
                .description("Standard B2C Cross-Zone (Up to 0.5 kg @ ₹75, +₹35/kg)")
                .active(true)
                .build());

        rateCardRepository.save(RateCard.builder()
                .orderType(OrderType.B2B)
                .isIntraZone(true)
                .baseWeightKg(5.0)
                .baseRate(BigDecimal.valueOf(180.00))
                .extraRatePerKg(BigDecimal.valueOf(15.00))
                .codSurchargeFixed(BigDecimal.valueOf(50.00))
                .codSurchargePercent(BigDecimal.valueOf(1.00))
                .minCharge(BigDecimal.valueOf(180.00))
                .description("B2B Bulk Local Intra-Zone (Up to 5 kg @ ₹180, +₹15/kg)")
                .active(true)
                .build());

        rateCardRepository.save(RateCard.builder()
                .orderType(OrderType.B2B)
                .isIntraZone(false)
                .baseWeightKg(5.0)
                .baseRate(BigDecimal.valueOf(320.00))
                .extraRatePerKg(BigDecimal.valueOf(25.00))
                .codSurchargeFixed(BigDecimal.valueOf(60.00))
                .codSurchargePercent(BigDecimal.valueOf(1.20))
                .minCharge(BigDecimal.valueOf(320.00))
                .description("B2B Bulk Cross-Zone (Up to 5 kg @ ₹320, +₹25/kg)")
                .active(true)
                .build());
    }

    private void seedUsers() {
        Zone south = zoneRepository.findByCode("SOUTH_ZONE").orElse(null);
        Zone north = zoneRepository.findByCode("NORTH_ZONE").orElse(null);
        Zone east = zoneRepository.findByCode("EAST_ZONE").orElse(null);
        Zone central = zoneRepository.findByCode("CENTRAL_ZONE").orElse(null);

        userRepository.save(User.builder()
                .name("Logistics Admin")
                .email("admin@delivery.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 98765 43210")
                .role(Role.ROLE_ADMIN)
                .isAvailable(true)
                .build());

        userRepository.save(User.builder()
                .name("Rajesh Kumar")
                .email("agent.rajesh@delivery.com")
                .password(passwordEncoder.encode("agent123"))
                .phone("+91 98111 22334")
                .role(Role.ROLE_AGENT)
                .assignedZone(south)
                .currentLatitude(12.9352)
                .currentLongitude(77.6245)
                .isAvailable(true)
                .build());

        userRepository.save(User.builder()
                .name("Priya Sharma")
                .email("agent.priya@delivery.com")
                .password(passwordEncoder.encode("agent123"))
                .phone("+91 98222 33445")
                .role(Role.ROLE_AGENT)
                .assignedZone(north)
                .currentLatitude(13.0358)
                .currentLongitude(77.5970)
                .isAvailable(true)
                .build());

        userRepository.save(User.builder()
                .name("Vikram Singh")
                .email("agent.vikram@delivery.com")
                .password(passwordEncoder.encode("agent123"))
                .phone("+91 98333 44556")
                .role(Role.ROLE_AGENT)
                .assignedZone(east)
                .currentLatitude(12.9698)
                .currentLongitude(77.7500)
                .isAvailable(true)
                .build());

        userRepository.save(User.builder()
                .name("Arun Nair")
                .email("agent.arun@delivery.com")
                .password(passwordEncoder.encode("agent123"))
                .phone("+91 98444 55667")
                .role(Role.ROLE_AGENT)
                .assignedZone(central)
                .currentLatitude(12.9716)
                .currentLongitude(77.5946)
                .isAvailable(true)
                .build());

        userRepository.save(User.builder()
                .name("Rohit Mehta")
                .email("customer.rohit@gmail.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("+91 99887 76655")
                .role(Role.ROLE_CUSTOMER)
                .isAvailable(true)
                .build());

        userRepository.save(User.builder()
                .name("Anita Desai (TechCorp B2B)")
                .email("anita@techcorp.com")
                .password(passwordEncoder.encode("customer123"))
                .phone("+91 99112 23344")
                .role(Role.ROLE_CUSTOMER)
                .isAvailable(true)
                .build());
    }

    private void seedSampleOrders() {
        User rohit = userRepository.findByEmail("customer.rohit@gmail.com").orElse(null);
        User anita = userRepository.findByEmail("anita@techcorp.com").orElse(null);
        User admin = userRepository.findByEmail("admin@delivery.com").orElse(null);

        if (rohit != null) {

            CreateOrderRequestDto o1 = new CreateOrderRequestDto();
            o1.setSenderName("Rohit Mehta");
            o1.setSenderPhone("+91 99887 76655");
            o1.setPickupAddress("Flat 402, Sunshine Apts, 5th Block Koramangala");
            o1.setPickupPincode("560034");
            o1.setPickupArea("Koramangala");
            o1.setPickupCity("Bengaluru");
            o1.setPickupLatitude(12.9352);
            o1.setPickupLongitude(77.6245);

            o1.setReceiverName("Siddharth Rao");
            o1.setReceiverPhone("+91 97777 88899");
            o1.setDropAddress("Plot 12, Sector 2, HSR Layout");
            o1.setDropPincode("560102");
            o1.setDropArea("HSR Layout");
            o1.setDropCity("Bengaluru");
            o1.setDropLatitude(12.9121);
            o1.setDropLongitude(77.6446);

            o1.setLengthCm(25.0);
            o1.setBreadthCm(20.0);
            o1.setHeightCm(10.0);
            o1.setActualWeightKg(0.8);
            o1.setOrderType(OrderType.B2C);
            o1.setPaymentType(PaymentType.PREPAID);
            o1.setAutoAssign(true);

            orderLifecycleService.createOrder(o1, rohit);
        }

        if (anita != null) {

            CreateOrderRequestDto o2 = new CreateOrderRequestDto();
            o2.setSenderName("Anita Desai");
            o2.setSenderPhone("+91 99112 23344");
            o2.setPickupAddress("TechCorp Warehouse 4, ITPL Main Road, Whitefield");
            o2.setPickupPincode("560066");
            o2.setPickupArea("Whitefield");
            o2.setPickupCity("Bengaluru");
            o2.setPickupLatitude(12.9698);
            o2.setPickupLongitude(77.7500);

            o2.setReceiverName("Apex Manufacturing Hub");
            o2.setReceiverPhone("+91 91234 56780");
            o2.setDropAddress("Phase 1, Peenya Industrial Area");
            o2.setDropPincode("560058");
            o2.setDropArea("Peenya Industrial Area");
            o2.setDropCity("Bengaluru");
            o2.setDropLatitude(13.0285);
            o2.setDropLongitude(77.5197);

            o2.setLengthCm(60.0);
            o2.setBreadthCm(50.0);
            o2.setHeightCm(40.0);
            o2.setActualWeightKg(18.5);
            o2.setOrderType(OrderType.B2B);
            o2.setPaymentType(PaymentType.COD);
            o2.setDeclaredValue(BigDecimal.valueOf(8500.00));
            o2.setAutoAssign(true);

            orderLifecycleService.createOrder(o2, anita);
        }
    }
}
