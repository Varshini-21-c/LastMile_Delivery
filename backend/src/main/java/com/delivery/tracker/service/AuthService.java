package com.delivery.tracker.service;

import com.delivery.tracker.config.JwtUtils;
import com.delivery.tracker.dto.auth.AuthResponse;
import com.delivery.tracker.dto.auth.LoginRequest;
import com.delivery.tracker.dto.auth.RegisterRequest;
import com.delivery.tracker.dto.auth.UserDto;
import com.delivery.tracker.entity.User;
import com.delivery.tracker.entity.Zone;
import com.delivery.tracker.enums.Role;
import com.delivery.tracker.repository.DeliveryOrderRepository;
import com.delivery.tracker.repository.UserRepository;
import com.delivery.tracker.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ZoneRepository zoneRepository;
    private final DeliveryOrderRepository deliveryOrderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtUtils.generateToken(userDetails, user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .user(toUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;
        Zone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId()).orElse(null);
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .assignedZone(zone)
                .isAvailable(true)
                .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String jwtToken = jwtUtils.generateToken(userDetails, savedUser.getRole().name(), savedUser.getId());

        return AuthResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .user(toUserDto(savedUser))
                .build();
    }

    public UserDto toUserDto(User user) {
        long activeOrders = 0;
        if (user.getRole() == Role.ROLE_AGENT) {
            activeOrders = deliveryOrderRepository.countActiveOrdersForAgent(user);
        }

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .zoneId(user.getAssignedZone() != null ? user.getAssignedZone().getId() : null)
                .zoneName(user.getAssignedZone() != null ? user.getAssignedZone().getName() : null)
                .zoneCode(user.getAssignedZone() != null ? user.getAssignedZone().getCode() : null)
                .currentLatitude(user.getCurrentLatitude())
                .currentLongitude(user.getCurrentLongitude())
                .isAvailable(user.getIsAvailable())
                .activeOrdersCount(activeOrders)
                .build();
    }
}
