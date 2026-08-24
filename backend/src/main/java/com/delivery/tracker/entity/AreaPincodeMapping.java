package com.delivery.tracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "area_pincode_mappings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaPincodeMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String pincode;

    @Column(nullable = false)
    private String areaName;

    private String city;

    private String state;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Boolean active = true;
}
