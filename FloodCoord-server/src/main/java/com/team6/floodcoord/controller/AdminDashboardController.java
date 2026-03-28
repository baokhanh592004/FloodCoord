package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.response.AdminDashboardResponse;
import com.team6.floodcoord.service.AdminAnalyticsService;
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
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê Dashboard tổng quan cho Admin")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareEndDate
    ) {
        return ResponseEntity.ok(adminAnalyticsService.getDashboardStats(startDate, endDate, compareStartDate, compareEndDate));
    }
}
