package com.delivery.tracker.service;

import com.delivery.tracker.dto.admin.RateCardDto;
import com.delivery.tracker.entity.RateCard;
import com.delivery.tracker.enums.OrderType;
import com.delivery.tracker.repository.RateCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RateCardService {

    private final RateCardRepository rateCardRepository;

    public List<RateCardDto> getAllRateCards() {
        return rateCardRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public RateCardDto getRateCardById(Long id) {
        RateCard card = rateCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rate card not found: " + id));
        return toDto(card);
    }

    @Transactional
    public RateCardDto createRateCard(RateCardDto dto) {
        Optional<RateCard> existing = rateCardRepository.findByOrderTypeAndIsIntraZone(dto.getOrderType(), dto.getIsIntraZone());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Rate card already exists for " + dto.getOrderType() + " (" + (dto.getIsIntraZone() ? "Intra-Zone" : "Inter-Zone") + "). Please update existing.");
        }

        RateCard card = RateCard.builder()
                .orderType(dto.getOrderType())
                .isIntraZone(dto.getIsIntraZone())
                .baseWeightKg(dto.getBaseWeightKg())
                .baseRate(dto.getBaseRate())
                .extraRatePerKg(dto.getExtraRatePerKg())
                .codSurchargeFixed(dto.getCodSurchargeFixed())
                .codSurchargePercent(dto.getCodSurchargePercent())
                .minCharge(dto.getMinCharge())
                .description(dto.getDescription())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();

        return toDto(rateCardRepository.save(card));
    }

    @Transactional
    public RateCardDto updateRateCard(Long id, RateCardDto dto) {
        RateCard card = rateCardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rate card not found: " + id));

        card.setOrderType(dto.getOrderType());
        card.setIsIntraZone(dto.getIsIntraZone());
        card.setBaseWeightKg(dto.getBaseWeightKg());
        card.setBaseRate(dto.getBaseRate());
        card.setExtraRatePerKg(dto.getExtraRatePerKg());
        card.setCodSurchargeFixed(dto.getCodSurchargeFixed());
        card.setCodSurchargePercent(dto.getCodSurchargePercent());
        card.setMinCharge(dto.getMinCharge());
        card.setDescription(dto.getDescription());
        if (dto.getActive() != null) {
            card.setActive(dto.getActive());
        }

        return toDto(rateCardRepository.save(card));
    }

    @Transactional
    public void deleteRateCard(Long id) {
        rateCardRepository.deleteById(id);
    }

    private RateCardDto toDto(RateCard card) {
        return RateCardDto.builder()
                .id(card.getId())
                .orderType(card.getOrderType())
                .isIntraZone(card.getIsIntraZone())
                .baseWeightKg(card.getBaseWeightKg())
                .baseRate(card.getBaseRate())
                .extraRatePerKg(card.getExtraRatePerKg())
                .codSurchargeFixed(card.getCodSurchargeFixed())
                .codSurchargePercent(card.getCodSurchargePercent())
                .minCharge(card.getMinCharge())
                .description(card.getDescription())
                .active(card.getActive())
                .build();
    }
}
