package com.delivery.tracker.repository;

import com.delivery.tracker.entity.RateCard;
import com.delivery.tracker.enums.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {
    Optional<RateCard> findByOrderTypeAndIsIntraZoneAndActiveTrue(OrderType orderType, Boolean isIntraZone);
    Optional<RateCard> findByOrderTypeAndIsIntraZone(OrderType orderType, Boolean isIntraZone);
}
