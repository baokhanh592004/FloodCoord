package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.UpdateProgressDTO;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.service.RescueRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/mission")
@RequiredArgsConstructor
@Tag(name = "Rescue Mission Execution", description = "Tác vụ hiện trường của Đội cứu hộ")
public class RescueMissionController {
    private final RescueRequestService requestService;

    @PutMapping("/requests/{requestId}/progress")
    // Chỉ cho phép Role RESCUE_TEAM (Leader) hoặc Quản lý truy cập
    @PreAuthorize("hasRole('RESCUE_TEAM') or hasRole('MANAGER') or hasRole('ADMIN')")
    @Operation(summary = "Cập nhật tiến độ (MOVING, ARRIVED, RESCUING)")
    public ResponseEntity<String> updateProgress(
            @PathVariable UUID requestId,
            @RequestBody UpdateProgressDTO dto,
            @AuthenticationPrincipal User currentUser
    ) {
        requestService.updateProgress(requestId, dto, currentUser);
        return ResponseEntity.ok("Mission progress updated successfully.");
    }
}
