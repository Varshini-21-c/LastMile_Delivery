package com.delivery.tracker.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private long totalOrders;
    private long activeOrders;
    private long deliveredOrders;
    private long failedOrders;
    private long rescheduledOrders;
    private BigDecimal totalDeliveredRevenue;
    private long totalCustomers;
    private long totalAgents;
    private long availableAgents;
    private long totalZones;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> ordersByZone;
}
