package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.response.CoordinatorDashboardResponse;
import com.team6.floodcoord.service.CoordinatorAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/coordinator")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('COORDINATOR', 'MANAGER')")
public class CoordinatorDashboardController {
    private final CoordinatorAnalyticsService coordinatorAnalyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê Dashboard tổng quan cho Coordinator")
    public ResponseEntity<CoordinatorDashboardResponse> getDashboardStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareEndDate
    ) {
        return ResponseEntity.ok(coordinatorAnalyticsService.getDashboardStats(startDate, endDate, compareStartDate, compareEndDate));
    }
}
