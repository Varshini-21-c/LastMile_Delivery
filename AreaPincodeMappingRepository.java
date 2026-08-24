package com.delivery.tracker.repository;

import com.delivery.tracker.entity.AreaPincodeMapping;
import com.delivery.tracker.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaPincodeMappingRepository extends JpaRepository<AreaPincodeMapping, Long> {
    Optional<AreaPincodeMapping> findByPincode(String pincode);
    List<AreaPincodeMapping> findByZone(Zone zone);
    Optional<AreaPincodeMapping> findFirstByAreaNameIgnoreCase(String areaName);
}
