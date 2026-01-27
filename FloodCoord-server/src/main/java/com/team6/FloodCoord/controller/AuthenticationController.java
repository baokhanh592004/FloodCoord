package com.team6.floodcoord.controller;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.dto.request.LoginRequest;
import com.team6.floodcoord.dto.request.RefreshTokenRequest;
import com.team6.floodcoord.dto.response.LoginResponse;
import com.team6.floodcoord.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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

}
