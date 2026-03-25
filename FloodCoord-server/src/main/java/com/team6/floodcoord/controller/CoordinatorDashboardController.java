package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.response.CoordinatorDashboardResponse;
import com.team6.floodcoord.service.CoordinatorAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coordinator")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('COORDINATOR', 'MANAGER')")
public class CoordinatorDashboardController {
    private final CoordinatorAnalyticsService coordinatorAnalyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê Dashboard tổng quan cho Coordinator")
    public ResponseEntity<CoordinatorDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(coordinatorAnalyticsService.getDashboardStats());
    }
}
