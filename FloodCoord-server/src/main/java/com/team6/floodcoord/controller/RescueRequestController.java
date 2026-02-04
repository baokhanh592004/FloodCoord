package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.CitizenConfirmRequest;
import com.team6.floodcoord.dto.request.CreateRescueRequestDTO;
import com.team6.floodcoord.dto.response.CreateRequestResponse;
import com.team6.floodcoord.dto.response.RescueRequestResponse;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.service.RescueRequestService;
import io.swagger.v3.oas.annotations.Operation;
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
        CreateRequestResponse response = rescueRequestService.createRescueRequest(dto, currentUser);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/track")
    @Operation(summary = "Tra cứu trạng thái hồ sơ bằng mã Tracking Code")
    public ResponseEntity<RescueRequestResponse> trackRequest(@RequestParam String code) {
        return ResponseEntity.ok(rescueRequestService.trackRequest(code));
    }

    @PostMapping("/{requestId}/confirm")
    @Operation(summary = "Bước 6: Người dân xác nhận & Gửi đánh giá (Kết thúc nhiệm vụ)")
    public ResponseEntity<String> confirmCompletion(
            @PathVariable UUID requestId,
            @RequestBody CitizenConfirmRequest dto,
            @AuthenticationPrincipal User currentUser
    ) {
        rescueRequestService.confirmCompletion(requestId, dto, currentUser);
        return ResponseEntity.ok("Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.");
    }
}
