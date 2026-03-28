package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.AssignTeamRequest;
import com.team6.floodcoord.dto.request.CreateIncidentRequest;
import com.team6.floodcoord.dto.request.ResolveIncidentRequest;
import com.team6.floodcoord.dto.response.IncidentReportResponse;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.service.IncidentReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Tag(name = "Incident Report", description = "Quản lý báo cáo sự cố (Xe hỏng, sạt lở, thiếu người...)")
public class IncidentReportController {
    private final IncidentReportService incidentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('RESCUE_TEAM') or hasRole('MANAGER')")
    @Operation(summary = "Leader gửi báo cáo sự cố (Kèm ảnh)")
    public ResponseEntity<String> reportIncident(
            @ModelAttribute CreateIncidentRequest request,
            @AuthenticationPrincipal User leader) {
        incidentService.createIncidentReport(request, leader);
        return ResponseEntity.ok("Đã gửi báo cáo sự cố thành công. Vui lòng chờ Điều phối viên xử lý.");
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Coordinator hủy sự cố (Step 1: Giải phóng tài nguyên cũ)")
    public ResponseEntity<String> resolveIncident(
            @PathVariable Long id,
            @RequestBody ResolveIncidentRequest request,
            @AuthenticationPrincipal User coordinator) {
        incidentService.resolveIncident(id, request, coordinator);
        return ResponseEntity.ok("Đã hủy sự cố. Tài nguyên cũ đã được giải phóng. Vui lòng giao đội mới qua API assign-team.");
    }

    @PostMapping("/{id}/assign-team")
    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Coordinator giao nhiệm vụ cho đội mới (Step 2: Sau khi đã hủy)")
    public ResponseEntity<String> assignTeamToIncident(
            @PathVariable Long id,
            @RequestBody AssignTeamRequest request,
            @AuthenticationPrincipal User coordinator) {
        incidentService.assignTeamToIncident(id, request, coordinator);
        return ResponseEntity.ok("Đã giao nhiệm vụ cho đội mới thành công.");
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Lấy danh sách các sự cố ĐANG CHỜ xử lý (Để làm Notification Chuông)")
    public ResponseEntity<List<IncidentReportResponse>> getPendingIncidents() {
        return ResponseEntity.ok(incidentService.getPendingIncidents());
    }

    @GetMapping
    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Lấy toàn bộ lịch sử báo cáo sự cố")
    public ResponseEntity<List<IncidentReportResponse>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/request/{requestId}/latest")
    @PreAuthorize("hasRole('RESCUE_TEAM') or hasRole('COORDINATOR') or hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Lấy sự cố mới nhất theo nhiệm vụ (để team leader chờ quyết định coordinator)")
    public ResponseEntity<IncidentReportResponse> getLatestIncidentByRequest(
            @PathVariable UUID requestId,
            @AuthenticationPrincipal User requester) {
        return ResponseEntity.ok(incidentService.getLatestIncidentByRequest(requestId, requester));
    }
}
