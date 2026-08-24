package com.delivery.tracker.controller;

import com.delivery.tracker.dto.order.QuoteRequestDto;
import com.delivery.tracker.dto.order.QuoteResponseDto;
import com.delivery.tracker.service.RateCalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuoteController {

    private final RateCalculationService rateCalculationService;

    @PostMapping("/calculate")
    public ResponseEntity<QuoteResponseDto> calculateQuote(@Valid @RequestBody QuoteRequestDto request) {
        QuoteResponseDto response = rateCalculationService.calculateQuote(request);
        return ResponseEntity.ok(response);
    }
}
