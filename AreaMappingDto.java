package com.delivery.tracker.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AreaMappingDto {
    private Long id;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    @NotBlank(message = "Area name is required")
    private String areaName;

    private String city;
    private String state;

    @NotNull(message = "Zone ID is required")
    private Long zoneId;
    private String zoneName;
    private String zoneCode;

    private Double latitude;
    private Double longitude;
    private Boolean active;
}
