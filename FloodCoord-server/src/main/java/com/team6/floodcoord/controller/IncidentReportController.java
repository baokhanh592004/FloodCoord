package com.team6.floodcoord.controller;

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
    @Operation(summary = "Coordinator phản hồi sự cố (Quyết định CONTINUE hoặc ABORT)")
    public ResponseEntity<String> resolveIncident(
            @PathVariable Long id,
            @RequestBody ResolveIncidentRequest request,
            @AuthenticationPrincipal User coordinator) {
        incidentService.resolveIncident(id, request, coordinator);
        return ResponseEntity.ok("Đã xử lý sự cố và hệ thống đã cập nhật tự động.");
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
}
