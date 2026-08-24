package com.delivery.tracker.repository;

import com.delivery.tracker.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByTrackingNumberOrderBySentAtDesc(String trackingNumber);
    List<NotificationLog> findByRecipientEmailOrderBySentAtDesc(String recipientEmail);
    List<NotificationLog> findAllByOrderBySentAtDesc();
}
