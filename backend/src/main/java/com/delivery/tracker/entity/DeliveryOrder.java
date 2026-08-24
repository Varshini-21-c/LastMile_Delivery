package com.delivery.tracker.entity;

import com.delivery.tracker.enums.OrderStatus;
import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.enums.PaymentType;
import com.delivery.tracker.enums.RateZoneType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivery_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    private Boolean createdByAdmin;

    private String senderName;
    private String senderPhone;
    @Column(nullable = false, length = 500)
    private String pickupAddress;
    @Column(nullable = false)
    private String pickupPincode;
    private String pickupArea;
    private String pickupCity;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pickup_zone_id")
    private Zone pickupZone;
    private Double pickupLatitude;
    private Double pickupLongitude;

    private String receiverName;
    private String receiverPhone;
    @Column(nullable = false, length = 500)
    private String dropAddress;
    @Column(nullable = false)
    private String dropPincode;
    private String dropArea;
    private String dropCity;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "drop_zone_id")
    private Zone dropZone;
    private Double dropLatitude;
    private Double dropLongitude;

    private Double lengthCm;
    private Double breadthCm;
    private Double heightCm;
    @Column(nullable = false)
    private Double actualWeightKg;
    @Column(nullable = false)
    private Double volumetricWeightKg;
    @Column(nullable = false)
    private Double chargeableWeightKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private RateZoneType rateZoneType;

    private BigDecimal declaredValue;
    private BigDecimal baseRate;
    private BigDecimal extraWeightCharge;
    private BigDecimal codSurcharge;
    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_agent_id")
    private User assignedAgent;

    private LocalDateTime assignedAt;

    private String failureReason;
    private String failureNotes;
    private LocalDateTime failedAt;

    private LocalDate rescheduledDate;
    private String rescheduledSlot;
    private String rescheduleReason;
    @Builder.Default
    private Integer rescheduleCount = 0;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    private LocalDateTime deliveredAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("timestamp DESC")
    @JsonIgnoreProperties("order")
    @Builder.Default
    private List<OrderTrackingHistory> trackingHistory = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public Boolean getCreatedByAdmin() {
        return createdByAdmin;
    }

    public void setCreatedByAdmin(Boolean createdByAdmin) {
        this.createdByAdmin = createdByAdmin;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderPhone() {
        return senderPhone;
    }

    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getPickupPincode() {
        return pickupPincode;
    }

    public void setPickupPincode(String pickupPincode) {
        this.pickupPincode = pickupPincode;
    }

    public String getPickupArea() {
        return pickupArea;
    }

    public void setPickupArea(String pickupArea) {
        this.pickupArea = pickupArea;
    }

    public String getPickupCity() {
        return pickupCity;
    }

    public void setPickupCity(String pickupCity) {
        this.pickupCity = pickupCity;
    }

    public Zone getPickupZone() {
        return pickupZone;
    }

    public void setPickupZone(Zone pickupZone) {
        this.pickupZone = pickupZone;
    }

    public Double getPickupLatitude() {
        return pickupLatitude;
    }

    public void setPickupLatitude(Double pickupLatitude) {
        this.pickupLatitude = pickupLatitude;
    }

    public Double getPickupLongitude() {
        return pickupLongitude;
    }

    public void setPickupLongitude(Double pickupLongitude) {
        this.pickupLongitude = pickupLongitude;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverPhone() {
        return receiverPhone;
    }

    public void setReceiverPhone(String receiverPhone) {
        this.receiverPhone = receiverPhone;
    }

    public String getDropAddress() {
        return dropAddress;
    }

    public void setDropAddress(String dropAddress) {
        this.dropAddress = dropAddress;
    }

    public String getDropPincode() {
        return dropPincode;
    }

    public void setDropPincode(String dropPincode) {
        this.dropPincode = dropPincode;
    }

    public String getDropArea() {
        return dropArea;
    }

    public void setDropArea(String dropArea) {
        this.dropArea = dropArea;
    }

    public String getDropCity() {
        return dropCity;
    }

    public void setDropCity(String dropCity) {
        this.dropCity = dropCity;
    }

    public Zone getDropZone() {
        return dropZone;
    }

    public void setDropZone(Zone dropZone) {
        this.dropZone = dropZone;
    }

    public Double getDropLatitude() {
        return dropLatitude;
    }

    public void setDropLatitude(Double dropLatitude) {
        this.dropLatitude = dropLatitude;
    }

    public Double getDropLongitude() {
        return dropLongitude;
    }

    public void setDropLongitude(Double dropLongitude) {
        this.dropLongitude = dropLongitude;
    }

    public Double getLengthCm() {
        return lengthCm;
    }

    public void setLengthCm(Double lengthCm) {
        this.lengthCm = lengthCm;
    }

    public Double getBreadthCm() {
        return breadthCm;
    }

    public void setBreadthCm(Double breadthCm) {
        this.breadthCm = breadthCm;
    }

    public Double getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Double heightCm) {
        this.heightCm = heightCm;
    }

    public Double getActualWeightKg() {
        return actualWeightKg;
    }

    public void setActualWeightKg(Double actualWeightKg) {
        this.actualWeightKg = actualWeightKg;
    }

    public Double getVolumetricWeightKg() {
        return volumetricWeightKg;
    }

    public void setVolumetricWeightKg(Double volumetricWeightKg) {
        this.volumetricWeightKg = volumetricWeightKg;
    }

    public Double getChargeableWeightKg() {
        return chargeableWeightKg;
    }

    public void setChargeableWeightKg(Double chargeableWeightKg) {
        this.chargeableWeightKg = chargeableWeightKg;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public RateZoneType getRateZoneType() {
        return rateZoneType;
    }

    public void setRateZoneType(RateZoneType rateZoneType) {
        this.rateZoneType = rateZoneType;
    }

    public BigDecimal getDeclaredValue() {
        return declaredValue;
    }

    public void setDeclaredValue(BigDecimal declaredValue) {
        this.declaredValue = declaredValue;
    }

    public BigDecimal getBaseRate() {
        return baseRate;
    }

    public void setBaseRate(BigDecimal baseRate) {
        this.baseRate = baseRate;
    }

    public BigDecimal getExtraWeightCharge() {
        return extraWeightCharge;
    }

    public void setExtraWeightCharge(BigDecimal extraWeightCharge) {
        this.extraWeightCharge = extraWeightCharge;
    }

    public BigDecimal getCodSurcharge() {
        return codSurcharge;
    }

    public void setCodSurcharge(BigDecimal codSurcharge) {
        this.codSurcharge = codSurcharge;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public User getAssignedAgent() {
        return assignedAgent;
    }

    public void setAssignedAgent(User assignedAgent) {
        this.assignedAgent = assignedAgent;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getFailureNotes() {
        return failureNotes;
    }

    public void setFailureNotes(String failureNotes) {
        this.failureNotes = failureNotes;
    }

    public LocalDateTime getFailedAt() {
        return failedAt;
    }

    public void setFailedAt(LocalDateTime failedAt) {
        this.failedAt = failedAt;
    }

    public LocalDate getRescheduledDate() {
        return rescheduledDate;
    }

    public void setRescheduledDate(LocalDate rescheduledDate) {
        this.rescheduledDate = rescheduledDate;
    }

    public String getRescheduledSlot() {
        return rescheduledSlot;
    }

    public void setRescheduledSlot(String rescheduledSlot) {
        this.rescheduledSlot = rescheduledSlot;
    }

    public String getRescheduleReason() {
        return rescheduleReason;
    }

    public void setRescheduleReason(String rescheduleReason) {
        this.rescheduleReason = rescheduleReason;
    }

    public Integer getRescheduleCount() {
        return rescheduleCount;
    }

    public void setRescheduleCount(Integer rescheduleCount) {
        this.rescheduleCount = rescheduleCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public List<OrderTrackingHistory> getTrackingHistory() {
        return trackingHistory;
    }

    public void setTrackingHistory(List<OrderTrackingHistory> trackingHistory) {
        this.trackingHistory = trackingHistory;
    }
}
