package com.delivery.tracker.service;

import com.delivery.tracker.entity.DeliveryOrder;
import com.delivery.tracker.entity.NotificationLog;
import com.delivery.tracker.enums.NotificationChannel;
import com.delivery.tracker.enums.OrderStatus;
import com.delivery.tracker.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;

    public void sendOrderStatusNotification(DeliveryOrder order, String previousStatus, String actorName) {
        OrderStatus status = order.getStatus();
        String customerEmail = order.getCustomer() != null ? order.getCustomer().getEmail() : "customer@delivery.com";
        String customerPhone = order.getCustomer() != null ? order.getCustomer().getPhone() : order.getReceiverPhone();
        String trackingNo = order.getTrackingNumber();

        String subject = "Shipment Update: " + trackingNo + " is " + status;
        String messageBody = buildNotificationMessage(order, previousStatus, actorName);

        NotificationLog emailLog = NotificationLog.builder()
                .orderId(order.getId())
                .trackingNumber(trackingNo)
                .recipientEmail(customerEmail)
                .recipientPhone(customerPhone)
                .channel(NotificationChannel.EMAIL)
                .eventType(status.name())
                .subject(subject)
                .message(messageBody)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
        notificationLogRepository.save(emailLog);

        String smsMessage = "Delivery Update [" + trackingNo + "]: " + getSmsSummary(order);
        NotificationLog smsLog = NotificationLog.builder()
                .orderId(order.getId())
                .trackingNumber(trackingNo)
                .recipientEmail(customerEmail)
                .recipientPhone(customerPhone)
                .channel(NotificationChannel.SMS)
                .eventType(status.name())
                .subject("SMS: " + trackingNo)
                .message(smsMessage)
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
        notificationLogRepository.save(smsLog);

        log.info("Dispatched Email & SMS notifications for order {} (Status: {})", trackingNo, status);
    }

    private String buildNotificationMessage(DeliveryOrder order, String previousStatus, String actorName) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(order.getReceiverName() != null ? order.getReceiverName() : "Customer").append(",\n\n");

        switch (order.getStatus()) {
            case CREATED -> sb.append("Your shipment ").append(order.getTrackingNumber())
                    .append(" has been booked successfully.\nPickup: ").append(order.getPickupAddress())
                    .append("\nDestination: ").append(order.getDropAddress())
                    .append("\nTotal Charges: ₹").append(order.getTotalAmount());
            case ASSIGNED -> sb.append("A delivery agent has been assigned to your shipment ")
                    .append(order.getTrackingNumber()).append(".\nAgent: ")
                    .append(order.getAssignedAgent() != null ? order.getAssignedAgent().getName() : "Courier Partner")
                    .append(order.getAssignedAgent() != null && order.getAssignedAgent().getPhone() != null ? " (Ph: " + order.getAssignedAgent().getPhone() + ")" : "");
            case PICKED_UP -> sb.append("Your package ").append(order.getTrackingNumber())
                    .append(" has been picked up by ").append(actorName != null ? actorName : "our agent")
                    .append(" and is en route to our hub.");
            case IN_TRANSIT -> sb.append("Your shipment ").append(order.getTrackingNumber())
                    .append(" is currently in transit between sorting centers.");
            case OUT_FOR_DELIVERY -> sb.append("Good news! Your shipment ").append(order.getTrackingNumber())
                    .append(" is OUT FOR DELIVERY today by agent ")
                    .append(order.getAssignedAgent() != null ? order.getAssignedAgent().getName() : "Courier")
                    .append(". Please ensure someone is available at ").append(order.getDropAddress());
            case DELIVERED -> sb.append("Your package ").append(order.getTrackingNumber())
                    .append(" has been successfully delivered. Thank you for choosing our delivery service!");
            case FAILED -> sb.append("Delivery Attempt Unsuccessful for ").append(order.getTrackingNumber())
                    .append(".\nReason: ").append(order.getFailureReason() != null ? order.getFailureReason() : "Customer unavailable")
                    .append(order.getFailureNotes() != null ? " (" + order.getFailureNotes() + ")" : "")
                    .append("\n\nYou can easily reschedule your delivery to a convenient date and time slot directly in your tracking dashboard.");
            case RESCHEDULED -> sb.append("Your delivery for ").append(order.getTrackingNumber())
                    .append(" has been rescheduled to ")
                    .append(order.getRescheduledDate()).append(" [Slot: ").append(order.getRescheduledSlot()).append("].")
                    .append("\nNew delivery agent will fulfill the delivery attempt on the requested date.");
            case CANCELLED -> sb.append("Your order ").append(order.getTrackingNumber()).append(" has been cancelled.");
        }

        sb.append("\n\nTrack live updates anytime at: /track/").append(order.getTrackingNumber());
        return sb.toString();
    }

    private String getSmsSummary(DeliveryOrder order) {
        return switch (order.getStatus()) {
            case CREATED -> "Order booked. Total: ₹" + order.getTotalAmount();
            case ASSIGNED -> "Agent " + (order.getAssignedAgent() != null ? order.getAssignedAgent().getName() : "assigned") + " is assigned.";
            case PICKED_UP -> "Package picked up and in transit.";
            case IN_TRANSIT -> "Package in transit to delivery station.";
            case OUT_FOR_DELIVERY -> "Out for delivery today!";
            case DELIVERED -> "Package delivered successfully.";
            case FAILED -> "Delivery attempt failed: " + (order.getFailureReason() != null ? order.getFailureReason() : "Unavailable") + ". Please reschedule on our portal.";
            case RESCHEDULED -> "Delivery rescheduled to " + order.getRescheduledDate() + " (" + order.getRescheduledSlot() + ").";
            case CANCELLED -> "Order has been cancelled.";
        };
    }

    public List<NotificationLog> getNotificationsByTrackingNumber(String trackingNumber) {
        return notificationLogRepository.findByTrackingNumberOrderBySentAtDesc(trackingNumber);
    }

    public List<NotificationLog> getAllNotifications() {
        return notificationLogRepository.findAllByOrderBySentAtDesc();
    }
}
