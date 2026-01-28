package com.team6.floodcoord.controller;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.dto.request.*;
import com.team6.floodcoord.dto.response.LoginResponse;
import com.team6.floodcoord.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user and returns JWT tokens")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        LoginResponse response = authenticationService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidates the current access token")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) throws ParseException {
        log.info("Logout request received");

        if (!authHeader.startsWith("Bearer ")){
            return ResponseEntity.badRequest().body("Invalid Authorization header format");
        }

        String token = authHeader.substring(7);
        authenticationService.logout(token);

        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generates new access token using refresh token")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request)
            throws ParseException, JOSEException {
        log.info("Token refresh request received");

        LoginResponse response = authenticationService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-pass")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password", description = "Changes the authenticated user's password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication){

        try {
            Long userId = Long.parseLong(authentication.getName());
            authenticationService.changePassword(userId, request);

            return ResponseEntity.ok("Password changed successfully!");
        } catch (NumberFormatException e) {
            log.error("Invalid user id in token: {}",authentication.getName());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid user id in token");
        } catch (IllegalArgumentException e){
            log.warn("Password change failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Sends password reset email if user exists")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request){
        log.info("Forgot password request for email: {}", request.getEmail());

        try {
            authenticationService.forgotPassword(request);
        } catch (Exception e) {
            log.warn("Forgot password error: {}", e.getMessage());
        }
        return ResponseEntity.ok("If an account with this email exists, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets password using reset token")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request){
        log.info("Password reset request received");

        try {
            authenticationService.resetPassword(request);
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (IllegalArgumentException e) {
            log.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
