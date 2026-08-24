package com.delivery.tracker.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneDto {
    private Long id;

    @NotBlank(message = "Zone code is required")
    private String code;

    @NotBlank(message = "Zone name is required")
    private String name;

    private String description;
    private Double centerLatitude;
    private Double centerLongitude;
    private Boolean active;
    private Long areaCount;
    private Long agentCount;
}
