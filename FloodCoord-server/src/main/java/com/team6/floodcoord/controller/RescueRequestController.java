package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.CreateRescueRequestDTO;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.service.RescueRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/rescue-requests")
@RequiredArgsConstructor
public class RescueRequestController {

    private final RescueRequestService rescueRequestService;

    /**
     * CITIZEN tạo yêu cầu cứu hộ
     */
    @PostMapping
    public ResponseEntity<?> createRescueRequest(
            @RequestBody CreateRescueRequestDTO dto,
            @AuthenticationPrincipal User currentUser
    ) {
        if (currentUser != null) {
            log.info("Create rescue request by user: {}", currentUser.getEmail());
        } else {
            log.info("Create rescue request by ANONYMOUS citizen");
        }
        UUID requestId = rescueRequestService.createRescueRequest(dto, currentUser);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(requestId);
    }
}
