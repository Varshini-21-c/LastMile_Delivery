package com.delivery.tracker.controller;

import com.delivery.tracker.dto.admin.AreaMappingDto;
import com.delivery.tracker.dto.admin.RateCardDto;
import com.delivery.tracker.dto.admin.ZoneDto;
import com.delivery.tracker.service.RateCardService;
import com.delivery.tracker.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicInfoController {

    private final ZoneService zoneService;
    private final RateCardService rateCardService;

    @GetMapping("/zones")
    public ResponseEntity<List<ZoneDto>> getPublicZones() {
        return ResponseEntity.ok(zoneService.getAllZones());
    }

    @GetMapping("/areas")
    public ResponseEntity<List<AreaMappingDto>> getPublicAreas() {
        return ResponseEntity.ok(zoneService.getAllAreaMappings());
    }

    @GetMapping("/rate-cards")
    public ResponseEntity<List<RateCardDto>> getPublicRateCards() {
        return ResponseEntity.ok(rateCardService.getAllRateCards());
    }
}
