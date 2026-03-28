package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.response.TeamLeaderDashboardResponse;
import com.team6.floodcoord.service.TeamLeaderAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/leader")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESCUE_TEAM')")
public class TeamLeaderDashboardController {
    private final TeamLeaderAnalyticsService teamLeaderAnalyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Lấy thống kê Dashboard cho Team Leader của đội hiện tại")
    public ResponseEntity<TeamLeaderDashboardResponse> getDashboardStats(
            Principal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareStartDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate compareEndDate) {
        // principal.getName() sẽ trả về email của người dùng đang đăng nhập (trích xuất từ JWT token)
        String userEmail = principal.getName();
        return ResponseEntity.ok(teamLeaderAnalyticsService.getDashboardStats(userEmail, startDate, endDate, compareStartDate, compareEndDate));
    }
}
