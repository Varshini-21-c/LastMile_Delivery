package com.delivery.tracker.repository;

import com.delivery.tracker.entity.User;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleAndIsAvailableTrue(Role role);
    List<User> findByRoleAndAssignedZoneAndIsAvailableTrue(Role role, Zone zone);
}
