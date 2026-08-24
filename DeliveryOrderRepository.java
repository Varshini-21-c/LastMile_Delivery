package com.delivery.tracker.repository;

import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    Optional<DeliveryOrder> findByTrackingNumber(String trackingNumber);
    List<DeliveryOrder> findByCustomerOrderByCreatedAtDesc(User customer);
    List<DeliveryOrder> findByAssignedAgentOrderByCreatedAtDesc(User assignedAgent);
    List<DeliveryOrder> findByStatus(OrderStatus status);
    List<DeliveryOrder> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(o) FROM DeliveryOrder o WHERE o.assignedAgent = :agent AND o.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')")
    long countActiveOrdersForAgent(@Param("agent") User agent);

    @Query("SELECT COUNT(o) FROM DeliveryOrder o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM DeliveryOrder o WHERE o.createdAt >= :since")
    long countCreatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(o.totalAmount) FROM DeliveryOrder o WHERE o.status = 'DELIVERED'")
    java.math.BigDecimal sumDeliveredRevenue();
}
