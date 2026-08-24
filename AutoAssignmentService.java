package com.delivery.tracker.service;

import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AutoAssignmentService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    private static final double ZONE_MISMATCH_PENALTY = 35.0;
    private static final double DISTANCE_WEIGHT = 2.0;
    private static final double ACTIVE_ORDER_WEIGHT = 10.0;

    private final UserRepository userRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;

    public Optional<User> findBestAvailableAgent(DeliveryOrder order) {

        List<User> availableAgents = userRepository.findByRoleAndIsAvailableTrue(Role.ROLE_AGENT);

        if (availableAgents.isEmpty()) {
            log.warn("No online delivery agents currently available for order {}", order.getTrackingNumber());

            List<User> allAgents = userRepository.findByRole(Role.ROLE_AGENT);
            if (allAgents.isEmpty()) {
                return Optional.empty();
            }
            return allAgents.stream()
                    .min(Comparator.comparingDouble(agent -> calculateAgentScore(agent, order)));
        }

        return availableAgents.stream()
                .min(Comparator.comparingDouble(agent -> calculateAgentScore(agent, order)));
    }

    private double calculateAgentScore(User agent, DeliveryOrder order) {
        double penalty = 0.0;

        Zone pickupZone = order.getPickupZone();
        if (pickupZone != null && agent.getAssignedZone() != null) {
            if (!pickupZone.getId().equals(agent.getAssignedZone().getId())) {
                penalty += ZONE_MISMATCH_PENALTY;
            }
        } else {
            penalty += 15.0;
        }

        if (agent.getCurrentLatitude() != null && agent.getCurrentLongitude() != null &&
            order.getPickupLatitude() != null && order.getPickupLongitude() != null) {

            double distanceKm = calculateHaversineDistance(
                    agent.getCurrentLatitude(), agent.getCurrentLongitude(),
                    order.getPickupLatitude(), order.getPickupLongitude()
            );
            penalty += distanceKm * DISTANCE_WEIGHT;
        } else {
            penalty += 20.0;
        }

        long activeOrders = deliveryOrderRepository.countActiveOrdersForAgent(agent);
        penalty += (activeOrders * ACTIVE_ORDER_WEIGHT);

        log.debug("Agent: {} | Active Orders: {} | Penalty Score: {}", agent.getName(), activeOrders, penalty);
        return penalty;
    }

    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return EARTH_RADIUS_KM * c;
    }
}
