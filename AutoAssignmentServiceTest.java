package com.delivery.tracker.service;

import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AutoAssignmentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DeliveryOrderRepository deliveryOrderRepository;

    @InjectMocks
    private AutoAssignmentService autoAssignmentService;

    private Zone southZone;
    private Zone northZone;
    private User southAgent1;
    private User southAgent2;
    private User northAgent;

    @BeforeEach
    void setUp() {
        southZone = Zone.builder().id(1L).code("SOUTH_ZONE").name("South Metro Hub").build();
        northZone = Zone.builder().id(2L).code("NORTH_ZONE").name("North Metro Hub").build();

        southAgent1 = User.builder()
                .id(101L)
                .name("Rajesh (South - Koramangala)")
                .role(Role.ROLE_AGENT)
                .assignedZone(southZone)
                .currentLatitude(12.9352)
                .currentLongitude(77.6245)
                .isAvailable(true)
                .build();

        southAgent2 = User.builder()
                .id(102L)
                .name("Suresh (South - Busy)")
                .role(Role.ROLE_AGENT)
                .assignedZone(southZone)
                .currentLatitude(12.9352)
                .currentLongitude(77.6245)
                .isAvailable(true)
                .build();

        northAgent = User.builder()
                .id(103L)
                .name("Priya (North Hub)")
                .role(Role.ROLE_AGENT)
                .assignedZone(northZone)
                .currentLatitude(13.0358)
                .currentLongitude(77.5970)
                .isAvailable(true)
                .build();
    }

    @Test
    @DisplayName("Auto-assignment picks agent in same zone and closest proximity with lowest active workload")
    void testAutoAssignmentBestAgentSelection() {
        when(userRepository.findByRoleAndIsAvailableTrue(Role.ROLE_AGENT))
                .thenReturn(List.of(southAgent1, southAgent2, northAgent));

        when(deliveryOrderRepository.countActiveOrdersForAgent(southAgent1)).thenReturn(0L);
        when(deliveryOrderRepository.countActiveOrdersForAgent(southAgent2)).thenReturn(3L);
        when(deliveryOrderRepository.countActiveOrdersForAgent(northAgent)).thenReturn(0L);

        DeliveryOrder order = DeliveryOrder.builder()
                .trackingNumber("TRK-2026-TEST01")
                .pickupZone(southZone)
                .pickupLatitude(12.9350)
                .pickupLongitude(77.6240)
                .build();

        Optional<User> assigned = autoAssignmentService.findBestAvailableAgent(order);

        assertTrue(assigned.isPresent());
        assertEquals(southAgent1.getId(), assigned.get().getId());
        assertEquals("Rajesh (South - Koramangala)", assigned.get().getName());
    }

    @Test
    @DisplayName("Haversine Distance calculation correctness")
    void testHaversineDistance() {

        double distance = autoAssignmentService.calculateHaversineDistance(12.9352, 77.6245, 12.9784, 77.6408);
        assertTrue(distance > 4.5 && distance < 6.5, "Distance should be approx 5.1 km");
    }
}
