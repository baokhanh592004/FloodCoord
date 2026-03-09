package com.team6.floodcoord.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.team6.floodcoord.dto.request.AttendanceRequestDTO;
import com.team6.floodcoord.dto.request.ReportRequestDTO;
import com.team6.floodcoord.dto.request.UpdateRescueStatusRequest;
import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.service.RescueRequestService;
import com.team6.floodcoord.service.TeamLeaderService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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

    @PutMapping("/rescue-request/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateRescueStatusRequest request) {

        teamLeaderService.updateRescueStatus(id, request.getStatus());
        return ResponseEntity.ok("Status updated successfully");
    }
//
//    @PostMapping(value = "/report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<?> submitReport(
//            @RequestPart(value = "data", required = true) ReportRequestDTO dto,
//            @RequestPart(value = "mediaFiles", required = false) MultipartFile[] mediaFiles) {
//
//
//        System.out.println(dto);
//        System.out.println(mediaFiles);
//
//        dto.setMediaFiles(mediaFiles);
//        teamLeaderService.submitReport(dto);
//        return ResponseEntity.ok("Report submitted successfully");
//    }
    @PostMapping(value = "/report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitReport(
            @RequestPart("data") String data,
            @RequestPart(value = "mediaFiles", required = false) MultipartFile[] mediaFiles) throws Exception {

        ObjectMapper mapper = new ObjectMapper();

        ReportRequestDTO dto = mapper.readValue(data, ReportRequestDTO.class);

        dto.setMediaFiles(mediaFiles);

        teamLeaderService.submitReport(dto);

        return ResponseEntity.ok("Report submitted successfully");
    }

    @GetMapping("/completed-requests")
    public ResponseEntity<?> getCompletedRequests(Authentication authentication) {

        User leader = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                teamLeaderService.getCompletedRequests(leader)
        );
    }
}
