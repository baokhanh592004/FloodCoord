package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.ProfileUpdateRequest;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Quản lý thông tin cá nhân (Dành cho mọi Role)")
public class ProfileController {
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Xem hồ sơ cá nhân của tôi")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal User currentUser) {
        // currentUser được Spring Security tự động inject từ JWT Token
        return ResponseEntity.ok(userService.getMyProfile(currentUser));
    }

    @PutMapping("/update")
    @Operation(summary = "Cập nhật thông tin cá nhân (Tên, Số điện thoại)")
    public ResponseEntity<UserResponse> updateMyProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(currentUser, request));
    }
}

