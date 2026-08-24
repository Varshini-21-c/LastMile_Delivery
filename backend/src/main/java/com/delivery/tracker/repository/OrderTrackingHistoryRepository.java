package com.delivery.tracker.repository;

import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.OrderTrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTrackingHistoryRepository extends JpaRepository<OrderTrackingHistory, Long> {
    List<OrderTrackingHistory> findByOrderOrderByTimestampDesc(DeliveryOrder order);
    List<OrderTrackingHistory> findByOrderOrderByTimestampAsc(DeliveryOrder order);
}
