package com.delivery.tracker.service;

import com.delivery.tracker.dto.admin.AreaMappingDto;
import com.delivery.tracker.dto.admin.ZoneDto;
import com.delivery.tracker.entity.AreaPincodeMapping;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.AreaPincodeMappingRepository;
import com.delivery.tracker.repository.UserRepository;
import com.delivery.tracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final AreaPincodeMappingRepository areaPincodeMappingRepository;
    private final UserRepository userRepository;

    public List<ZoneDto> getAllZones() {
        return zoneRepository.findAll().stream()
                .map(this::toZoneDto)
                .collect(Collectors.toList());
    }

    public ZoneDto getZoneById(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Zone not found with ID: " + id));
        return toZoneDto(zone);
    }

    @Transactional
    public ZoneDto createZone(ZoneDto dto) {
        if (zoneRepository.existsByCode(dto.getCode().toUpperCase())) {
            throw new IllegalArgumentException("Zone with code " + dto.getCode() + " already exists");
        }

        Zone zone = Zone.builder()
                .code(dto.getCode().toUpperCase().trim())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .centerLatitude(dto.getCenterLatitude())
                .centerLongitude(dto.getCenterLongitude())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return toZoneDto(zoneRepository.save(zone));
    }

    @Transactional
    public ZoneDto updateZone(Long id, ZoneDto dto) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Zone not found with ID: " + id));

        zone.setName(dto.getName());
        zone.setDescription(dto.getDescription());
        zone.setCenterLatitude(dto.getCenterLatitude());
        zone.setCenterLongitude(dto.getCenterLongitude());
        if (dto.getActive() != null) {
            zone.setActive(dto.getActive());
        }

        return toZoneDto(zoneRepository.save(zone));
    }

    @Transactional
    public void deleteZone(Long id) {
        zoneRepository.deleteById(id);
    }

    public List<AreaMappingDto> getAllAreaMappings() {
        return areaPincodeMappingRepository.findAll().stream()
                .map(this::toAreaDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AreaMappingDto createAreaMapping(AreaMappingDto dto) {
        Zone zone = zoneRepository.findById(dto.getZoneId())
                .orElseThrow(() -> new IllegalArgumentException("Zone not found with ID: " + dto.getZoneId()));

        AreaPincodeMapping mapping = AreaPincodeMapping.builder()
                .pincode(dto.getPincode().trim())
                .areaName(dto.getAreaName().trim())
                .city(dto.getCity())
                .state(dto.getState())
                .zone(zone)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return toAreaDto(areaPincodeMappingRepository.save(mapping));
    }

    @Transactional
    public AreaMappingDto updateAreaMapping(Long id, AreaMappingDto dto) {
        AreaPincodeMapping mapping = areaPincodeMappingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Area mapping not found with ID: " + id));

        Zone zone = zoneRepository.findById(dto.getZoneId())
                .orElseThrow(() -> new IllegalArgumentException("Zone not found with ID: " + dto.getZoneId()));

        mapping.setPincode(dto.getPincode().trim());
        mapping.setAreaName(dto.getAreaName().trim());
        mapping.setCity(dto.getCity());
        mapping.setState(dto.getState());
        mapping.setZone(zone);
        mapping.setLatitude(dto.getLatitude());
        mapping.setLongitude(dto.getLongitude());
        if (dto.getActive() != null) {
            mapping.setActive(dto.getActive());
        }

        return toAreaDto(areaPincodeMappingRepository.save(mapping));
    }

    @Transactional
    public void deleteAreaMapping(Long id) {
        areaPincodeMappingRepository.deleteById(id);
    }

    private ZoneDto toZoneDto(Zone zone) {
        List<AreaPincodeMapping> areas = areaPincodeMappingRepository.findByZone(zone);
        long agentCount = userRepository.findByRole(Role.ROLE_AGENT).stream()
                .filter(a -> a.getAssignedZone() != null && a.getAssignedZone().getId().equals(zone.getId()))
                .count();

        return ZoneDto.builder()
                .id(zone.getId())
                .code(zone.getCode())
                .name(zone.getName())
                .description(zone.getDescription())
                .centerLatitude(zone.getCenterLatitude())
                .centerLongitude(zone.getCenterLongitude())
                .active(zone.getActive())
                .areaCount((long) areas.size())
                .agentCount(agentCount)
                .build();
    }

    private AreaMappingDto toAreaDto(AreaPincodeMapping m) {
        return AreaMappingDto.builder()
                .id(m.getId())
                .pincode(m.getPincode())
                .areaName(m.getAreaName())
                .city(m.getCity())
                .state(m.getState())
                .zoneId(m.getZone() != null ? m.getZone().getId() : null)
                .zoneName(m.getZone() != null ? m.getZone().getName() : null)
                .zoneCode(m.getZone() != null ? m.getZone().getCode() : null)
                .latitude(m.getLatitude())
                .longitude(m.getLongitude())
                .active(m.getActive())
                .build();
    }
}
