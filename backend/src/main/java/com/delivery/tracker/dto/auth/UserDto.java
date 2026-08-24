package com.delivery.tracker.dto.auth;

import com.delivery.tracker.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Long zoneId;
    private String zoneName;
    private String zoneCode;
    private Double currentLatitude;
    private Double currentLongitude;
    private Boolean isAvailable;
    private Long activeOrdersCount;
}
