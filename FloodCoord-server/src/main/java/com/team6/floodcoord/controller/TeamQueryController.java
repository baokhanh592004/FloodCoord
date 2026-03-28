package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.response.RescueTeamResponse;
import com.team6.floodcoord.service.RescueTeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Team Query", description = "Truy vấn thông tin đội")
public class TeamQueryController {
    private final RescueTeamService rescueTeamService;

    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách các đội có trạng thái AVAILABLE (Dành cho Coordinator reassign)")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('COORDINATOR')")
    public ResponseEntity<List<RescueTeamResponse>> getAvailableTeams() {
        log.info("API: Get available teams called");
        List<RescueTeamResponse> teams = rescueTeamService.getAvailableTeams();
        log.info("API: Returning {} available teams", teams.size());
        teams.forEach(team -> log.info("  - {}: {}", team.getId(), team.getName()));
        return ResponseEntity.ok(teams);
    }
}
