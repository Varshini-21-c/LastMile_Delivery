package com.delivery.tracker.dto.order;

import lombok.Data;

@Data
public class AssignAgentRequestDto {

    private Long agentId;
    private Boolean autoAssign = false;
    private String remarks;
}
