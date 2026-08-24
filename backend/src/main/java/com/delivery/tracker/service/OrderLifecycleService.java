package com.delivery.tracker.service;

import com.delivery.tracker.dto.auth.UserDto;
import com.delivery.tracker.dto.order.*;
import com.delivery.tracker.entity.*;
import com.delivery.tracker.enums.OrderStatus;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.OrderTrackingHistoryRepository;
import com.delivery.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderLifecycleService {

    private static final String TRACKING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final DeliveryOrderRepository orderRepository;
    private final OrderTrackingHistoryRepository trackingHistoryRepository;
    private final UserRepository userRepository;
    private final RateCalculationService rateCalculationService;
    private final AutoAssignmentService autoAssignmentService;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponseDto createOrder(CreateOrderRequestDto request, User authenticatedUser) {

        User customer = authenticatedUser;
        boolean isCreatedByAdmin = false;

        if (authenticatedUser.getRole() == Role.ROLE_ADMIN && request.getCustomerId() != null) {
            customer = userRepository.findById(request.getCustomerId())
                    .orElse(authenticatedUser);
            isCreatedByAdmin = true;
        }

        QuoteRequestDto quoteParams = new QuoteRequestDto();
        quoteParams.setPickupPincode(request.getPickupPincode());
        quoteParams.setPickupArea(request.getPickupArea());
        quoteParams.setPickupCity(request.getPickupCity());
        quoteParams.setDropPincode(request.getDropPincode());
        quoteParams.setDropArea(request.getDropArea());
        quoteParams.setDropCity(request.getDropCity());
        quoteParams.setLengthCm(request.getLengthCm());
        quoteParams.setBreadthCm(request.getBreadthCm());
        quoteParams.setHeightCm(request.getHeightCm());
        quoteParams.setActualWeightKg(request.getActualWeightKg());
        quoteParams.setOrderType(request.getOrderType());
        quoteParams.setPaymentType(request.getPaymentType());
        quoteParams.setDeclaredValue(request.getDeclaredValue());

        QuoteResponseDto quote = rateCalculationService.calculateQuote(quoteParams);

        Zone pickupZone = rateCalculationService.detectZone(request.getPickupPincode(), request.getPickupArea());
        Zone dropZone = rateCalculationService.detectZone(request.getDropPincode(), request.getDropArea());

        String trackingNumber = generateTrackingNumber();

        DeliveryOrder order = DeliveryOrder.builder()
                .trackingNumber(trackingNumber)
                .customer(customer)
                .createdByAdmin(isCreatedByAdmin)

                .senderName(request.getSenderName())
                .senderPhone(request.getSenderPhone())
                .pickupAddress(request.getPickupAddress())
                .pickupPincode(request.getPickupPincode())
                .pickupArea(request.getPickupArea())
                .pickupCity(request.getPickupCity())
                .pickupZone(pickupZone)
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())

                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .dropAddress(request.getDropAddress())
                .dropPincode(request.getDropPincode())
                .dropArea(request.getDropArea())
                .dropCity(request.getDropCity())
                .dropZone(dropZone)
                .dropLatitude(request.getDropLatitude())
                .dropLongitude(request.getDropLongitude())

                .lengthCm(quote.getLengthCm())
                .breadthCm(quote.getBreadthCm())
                .heightCm(quote.getHeightCm())
                .actualWeightKg(quote.getActualWeightKg())
                .volumetricWeightKg(quote.getVolumetricWeightKg())
                .chargeableWeightKg(quote.getChargeableWeightKg())
                .orderType(quote.getOrderType())
                .paymentType(quote.getPaymentType())
                .rateZoneType(quote.getRateZoneType())
                .declaredValue(request.getDeclaredValue())
                .baseRate(quote.getBaseRate())
                .extraWeightCharge(quote.getExtraWeightCharge())
                .codSurcharge(quote.getCodSurcharge())
                .totalAmount(quote.getTotalAmount())
                .status(OrderStatus.CREATED)
                .rescheduleCount(0)
                .build();

        DeliveryOrder savedOrder = orderRepository.save(order);

        String remarks = String.format("Order placed with auto-calculated charge ₹%.2f (%s)",
                quote.getTotalAmount(), quote.getBilledOnReason());
        addTrackingHistory(savedOrder, OrderStatus.CREATED, authenticatedUser.getName(),
                authenticatedUser.getRole().name(), remarks, request.getPickupLatitude(), request.getPickupLongitude());

        notificationService.sendOrderStatusNotification(savedOrder, null, authenticatedUser.getName());

        if (request.getManualAgentId() != null) {
            assignAgentToOrder(savedOrder.getId(), request.getManualAgentId(), "Admin assigned delivery agent", authenticatedUser);
        } else if (Boolean.TRUE.equals(request.getAutoAssign())) {
            triggerAutoAssignment(savedOrder.getId(), authenticatedUser);
        }

        log.info("Successfully created and dispatched order {}", savedOrder.getTrackingNumber());
        return toOrderResponseDto(orderRepository.findById(savedOrder.getId()).orElse(savedOrder));
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatusUpdateRequestDto request, User actor) {
        DeliveryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        OrderStatus previousStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.FAILED) {
            order.setFailureReason(request.getFailureReason() != null ? request.getFailureReason() : "Delivery Attempt Failed");
            order.setFailureNotes(request.getFailureNotes());
            order.setFailedAt(LocalDateTime.now());
        }

        DeliveryOrder updatedOrder = orderRepository.save(order);

        String remarks = request.getRemarks();
        if (remarks == null || remarks.trim().isEmpty()) {
            remarks = (newStatus == OrderStatus.FAILED)
                    ? "Delivery attempt failed: " + order.getFailureReason()
                    : "Status updated to " + newStatus;
        }

        addTrackingHistory(updatedOrder, newStatus, actor.getName(), actor.getRole().name(),
                remarks, request.getCurrentLatitude(), request.getCurrentLongitude());

        notificationService.sendOrderStatusNotification(updatedOrder, previousStatus.name(), actor.getName());
        return toOrderResponseDto(updatedOrder);
    }

    @Transactional
    public OrderResponseDto rescheduleOrder(Long orderId, RescheduleRequestDto request, User actor) {
        DeliveryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        if (order.getStatus() != OrderStatus.FAILED) {
            throw new IllegalStateException("Only failed orders can be rescheduled. Current status: " + order.getStatus());
        }

        order.setRescheduledDate(request.getRescheduledDate());
        order.setRescheduledSlot(request.getRescheduledSlot());
        order.setRescheduleReason(request.getRescheduleReason());
        order.setRescheduleCount((order.getRescheduleCount() == null ? 0 : order.getRescheduleCount()) + 1);
        order.setStatus(OrderStatus.RESCHEDULED);

        DeliveryOrder updatedOrder = orderRepository.save(order);

        String remarks = String.format("Rescheduled to %s [%s]. Reschedule Attempt #%d",
                request.getRescheduledDate(), request.getRescheduledSlot(), order.getRescheduleCount());
        addTrackingHistory(updatedOrder, OrderStatus.RESCHEDULED, actor.getName(), actor.getRole().name(), remarks, null, null);

        Optional<User> bestAgent = autoAssignmentService.findBestAvailableAgent(updatedOrder);
        if (bestAgent.isPresent()) {
            updatedOrder.setAssignedAgent(bestAgent.get());
            updatedOrder.setAssignedAt(LocalDateTime.now());
            updatedOrder.setStatus(OrderStatus.ASSIGNED);
            orderRepository.save(updatedOrder);

            addTrackingHistory(updatedOrder, OrderStatus.ASSIGNED, "SYSTEM_DISPATCHER",
                    "SYSTEM", "Reassigned to agent " + bestAgent.get().getName() + " for rescheduled date", null, null);
        }

        notificationService.sendOrderStatusNotification(updatedOrder, OrderStatus.FAILED.name(), actor.getName());
        return toOrderResponseDto(updatedOrder);
    }

    @Transactional
    public OrderResponseDto assignAgentToOrder(Long orderId, Long agentId, String remarks, User actor) {
        DeliveryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found: " + agentId));

        order.setAssignedAgent(agent);
        order.setAssignedAt(LocalDateTime.now());
        if (order.getStatus() == OrderStatus.CREATED || order.getStatus() == OrderStatus.RESCHEDULED) {
            order.setStatus(OrderStatus.ASSIGNED);
        }

        DeliveryOrder saved = orderRepository.save(order);
        String note = (remarks != null && !remarks.isEmpty()) ? remarks : ("Assigned to agent " + agent.getName());
        addTrackingHistory(saved, saved.getStatus(), actor.getName(), actor.getRole().name(), note, null, null);

        notificationService.sendOrderStatusNotification(saved, OrderStatus.CREATED.name(), actor.getName());
        return toOrderResponseDto(saved);
    }

    @Transactional
    public OrderResponseDto triggerAutoAssignment(Long orderId, User actor) {
        DeliveryOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        Optional<User> bestAgent = autoAssignmentService.findBestAvailableAgent(order);
        if (bestAgent.isPresent()) {
            User agent = bestAgent.get();
            order.setAssignedAgent(agent);
            order.setAssignedAt(LocalDateTime.now());
            if (order.getStatus() == OrderStatus.CREATED || order.getStatus() == OrderStatus.RESCHEDULED) {
                order.setStatus(OrderStatus.ASSIGNED);
            }
            DeliveryOrder saved = orderRepository.save(order);

            String zoneInfo = agent.getAssignedZone() != null ? agent.getAssignedZone().getName() : "General";
            String note = String.format("Auto-assigned to nearest agent: %s (Zone: %s)", agent.getName(), zoneInfo);
            addTrackingHistory(saved, saved.getStatus(), "AUTO_DISPATCHER", "SYSTEM", note, null, null);

            notificationService.sendOrderStatusNotification(saved, OrderStatus.CREATED.name(), actor != null ? actor.getName() : "System");
            return toOrderResponseDto(saved);
        }

        log.warn("No agent currently eligible for auto-assignment on order {}", order.getTrackingNumber());
        return toOrderResponseDto(order);
    }

    public void addTrackingHistory(DeliveryOrder order, OrderStatus status, String actorName,
                                   String actorRole, String remarks, Double lat, Double lng) {
        OrderTrackingHistory history = OrderTrackingHistory.builder()
                .order(order)
                .status(status)
                .actorName(actorName)
                .actorRole(actorRole)
                .remarks(remarks)
                .locationLatitude(lat)
                .locationLongitude(lng)
                .timestamp(LocalDateTime.now())
                .build();
        trackingHistoryRepository.save(history);
    }

    public OrderResponseDto toOrderResponseDto(DeliveryOrder order) {
        List<OrderTrackingHistory> historyList = trackingHistoryRepository.findByOrderOrderByTimestampDesc(order);

        List<TrackingHistoryDto> historyDtos = historyList.stream()
                .map(h -> TrackingHistoryDto.builder()
                        .id(h.getId())
                        .status(h.getStatus())
                        .actorName(h.getActorName())
                        .actorRole(h.getActorRole())
                        .remarks(h.getRemarks())
                        .locationLatitude(h.getLocationLatitude())
                        .locationLongitude(h.getLocationLongitude())
                        .timestamp(h.getTimestamp())
                        .build())
                .collect(Collectors.toList());

        UserDto agentDto = null;
        if (order.getAssignedAgent() != null) {
            User a = order.getAssignedAgent();
            agentDto = UserDto.builder()
                    .id(a.getId())
                    .name(a.getName())
                    .email(a.getEmail())
                    .phone(a.getPhone())
                    .role(a.getRole())
                    .zoneId(a.getAssignedZone() != null ? a.getAssignedZone().getId() : null)
                    .zoneName(a.getAssignedZone() != null ? a.getAssignedZone().getName() : null)
                    .zoneCode(a.getAssignedZone() != null ? a.getAssignedZone().getCode() : null)
                    .currentLatitude(a.getCurrentLatitude())
                    .currentLongitude(a.getCurrentLongitude())
                    .isAvailable(a.getIsAvailable())
                    .build();
        }

        return OrderResponseDto.builder()
                .id(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getName() : null)
                .customerEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null)
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : null)
                .createdByAdmin(order.getCreatedByAdmin())

                .senderName(order.getSenderName())
                .senderPhone(order.getSenderPhone())
                .pickupAddress(order.getPickupAddress())
                .pickupPincode(order.getPickupPincode())
                .pickupArea(order.getPickupArea())
                .pickupCity(order.getPickupCity())
                .pickupZoneId(order.getPickupZone() != null ? order.getPickupZone().getId() : null)
                .pickupZoneCode(order.getPickupZone() != null ? order.getPickupZone().getCode() : null)
                .pickupZoneName(order.getPickupZone() != null ? order.getPickupZone().getName() : null)
                .pickupLatitude(order.getPickupLatitude())
                .pickupLongitude(order.getPickupLongitude())

                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .dropAddress(order.getDropAddress())
                .dropPincode(order.getDropPincode())
                .dropArea(order.getDropArea())
                .dropCity(order.getDropCity())
                .dropZoneId(order.getDropZone() != null ? order.getDropZone().getId() : null)
                .dropZoneCode(order.getDropZone() != null ? order.getDropZone().getCode() : null)
                .dropZoneName(order.getDropZone() != null ? order.getDropZone().getName() : null)
                .dropLatitude(order.getDropLatitude())
                .dropLongitude(order.getDropLongitude())

                .lengthCm(order.getLengthCm())
                .breadthCm(order.getBreadthCm())
                .heightCm(order.getHeightCm())
                .actualWeightKg(order.getActualWeightKg())
                .volumetricWeightKg(order.getVolumetricWeightKg())
                .chargeableWeightKg(order.getChargeableWeightKg())

                .orderType(order.getOrderType())
                .paymentType(order.getPaymentType())
                .rateZoneType(order.getRateZoneType())
                .declaredValue(order.getDeclaredValue())
                .baseRate(order.getBaseRate())
                .extraWeightCharge(order.getExtraWeightCharge())
                .codSurcharge(order.getCodSurcharge())
                .totalAmount(order.getTotalAmount())

                .status(order.getStatus())
                .assignedAgent(agentDto)
                .assignedAt(order.getAssignedAt())

                .failureReason(order.getFailureReason())
                .failureNotes(order.getFailureNotes())
                .failedAt(order.getFailedAt())
                .rescheduledDate(order.getRescheduledDate())
                .rescheduledSlot(order.getRescheduledSlot())
                .rescheduleReason(order.getRescheduleReason())
                .rescheduleCount(order.getRescheduleCount())

                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .deliveredAt(order.getDeliveredAt())
                .trackingHistory(historyDtos)
                .build();
    }

    private String generateTrackingNumber() {
        String year = DateTimeFormatter.ofPattern("yyyy").format(LocalDateTime.now());
        StringBuilder sb = new StringBuilder("TRK-").append(year).append("-");
        for (int i = 0; i < 6; i++) {
            sb.append(TRACKING_ALPHABET.charAt(RANDOM.nextInt(TRACKING_ALPHABET.length())));
        }
        return sb.toString();
    }
}
