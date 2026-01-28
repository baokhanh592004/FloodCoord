package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.UserRequest;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.Role;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.repository.RoleRepository;
import com.team6.floodcoord.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());

        //validation
        if (userRepository.existsByEmail(request.getEmail())){
            log.warn("Attempt to create user with existing email: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())){
            log.warn("Attempt to create user with existing phone number: {}", request.getPhoneNumber());
            throw new IllegalArgumentException("Phone number already exists: " + request.getPhoneNumber());
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Password and confirm password do not match for email: {}", request.getEmail());
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        Role role = roleRepository.findByRoleCode(request.getRollCode())
                .orElseThrow(() -> {
                    log.error("Role not found: {}", request.getRollCode());
                    return new IllegalArgumentException("Role not found: " + request.getRollCode());
                });

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(true)
                .role(role)
                .build();

        userRepository.save(user);
        log.info("User created successfully with ID: {} and email: {}", user.getId(), user.getEmail());


        return  mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .build();

        if (user.getRole() != null) {
            response.setRoleName(user.getRole().getRoleName());
        }

        return response;
    }

}
