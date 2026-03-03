package com.team6.floodcoord.controller;


import com.team6.floodcoord.dto.request.AttendanceRequestDTO;
import com.team6.floodcoord.service.RescueRequestService;
import com.team6.floodcoord.service.TeamLeaderService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/team-leader")
@RequiredArgsConstructor
public class TeamLeaderController {
    private final TeamLeaderService teamLeaderService;
    private final RescueRequestService rescueRequestService;

    // Leader tick present / absent cho từng member
    @PostMapping("/attendance")
    public ResponseEntity<?> markAttendance(
            @RequestBody AttendanceRequestDTO request
    ) {
        teamLeaderService.markAttendance(request);
        return ResponseEntity.ok("Attendance recorded successfully");
    }

    // Leader xem toàn bộ trạng thái check-in của team theo rescueId
    @GetMapping("/attendance/{rescueId}")
    public ResponseEntity<?> getAttendanceStatus(
            @PathVariable UUID rescueId
    ) {
        return ResponseEntity.ok(
                teamLeaderService.getAttendanceByRescue(rescueId)
        );
    }
    @Operation(summary = "Tất cả team member của 1 team đều có thể gọi api này, không riêng team leader")
    @GetMapping("/my-rescue-requests")
    public ResponseEntity<?> getMyRescueRequests() {
        return ResponseEntity.ok(
                rescueRequestService.getMyAssignedRescueRequests()
        );
    }
}
