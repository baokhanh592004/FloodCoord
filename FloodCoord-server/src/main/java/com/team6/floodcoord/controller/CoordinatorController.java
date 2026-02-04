package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.AssignTaskRequest;
import com.team6.floodcoord.dto.request.VerifyRequestDTO;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.service.RescueRequestServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/coordinator/requests")
@RequiredArgsConstructor
@Tag(name = "Coordinator Workflow", description = "Chức năng điều phối")
@PreAuthorize("hasRole('COORDINATOR') or hasRole('MANAGER') or hasRole('ADMIN')")
public class CoordinatorController {
    private final RescueRequestServiceImpl requestService;

    @PostMapping("/{requestId}/assign")
    @Operation(summary = "Phân công nhiệm vụ (Gán Team, Xe, Vật tư)")
    public ResponseEntity<String> assignTask(
            @PathVariable UUID requestId,
            @RequestBody AssignTaskRequest requestDTO,
            @AuthenticationPrincipal User coordinator
    ) {
        requestService.assignTask(requestId, requestDTO, coordinator);
        return ResponseEntity.ok("Task assigned successfully to Rescue Team");
    }

    @PutMapping("/{requestId}/verify")
    @Operation(summary = "Bước 02: Xác minh yêu cầu (Chuyển trạng thái PENDING -> VERIFIED)")
    public ResponseEntity<String> verifyRequest(
            @PathVariable UUID requestId,
            @RequestBody VerifyRequestDTO requestDTO,
            @AuthenticationPrincipal User coordinator
    ) {
        requestService.verifyRequest(requestId, requestDTO, coordinator);
        return ResponseEntity.ok("Request verified successfully. Status changed to VERIFIED.");
    }
}
