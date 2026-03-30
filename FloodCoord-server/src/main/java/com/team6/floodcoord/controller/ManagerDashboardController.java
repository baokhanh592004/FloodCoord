package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.response.ManagerDashboardResponse;
import com.team6.floodcoord.service.ManagerAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class ManagerDashboardController {
    private final ManagerAnalyticsService managerAnalyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê Quản trị Nguồn lực (Real-time) cho Manager")
    public ResponseEntity<ManagerDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(managerAnalyticsService.getDashboardStats());
    }
}
