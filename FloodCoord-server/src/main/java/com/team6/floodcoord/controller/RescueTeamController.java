package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.RescueTeamRequest;
import com.team6.floodcoord.dto.response.RescueTeamResponse;
import com.team6.floodcoord.service.RescueTeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rescue-teams")
@RequiredArgsConstructor
@Tag(name = "Rescue Team Management", description = "Quản lý các đội cứu hộ")
@PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
public class RescueTeamController {
    private final RescueTeamService rescueTeamService;

    @PostMapping
    @Operation(summary = "Tạo đội cứu hộ mới")
    public ResponseEntity<RescueTeamResponse> createTeam(@RequestBody RescueTeamRequest request) {
        return ResponseEntity.ok(rescueTeamService.createTeam(request));
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các đội")
    public ResponseEntity<List<RescueTeamResponse>> getAllTeams() {
        return ResponseEntity.ok(rescueTeamService.getAllTeams());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết một đội (kèm danh sách thành viên)")
    public ResponseEntity<RescueTeamResponse> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(rescueTeamService.getTeamById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin đội (Đổi tên, đổi leader, thêm thành viên)")
    public ResponseEntity<RescueTeamResponse> updateTeam(@PathVariable Long id, @RequestBody RescueTeamRequest request) {
        return ResponseEntity.ok(rescueTeamService.updateTeam(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa đội cứu hộ (Giải phóng thành viên trước khi xóa)")
    public ResponseEntity<String> deleteTeam(@PathVariable Long id) {
        rescueTeamService.deleteTeam(id);
        return ResponseEntity.ok("Deleted team successfully");
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @Operation(summary = "Xóa một thành viên khỏi đội")
    public ResponseEntity<String> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        rescueTeamService.removeMemberFromTeam(teamId, userId);
        return ResponseEntity.ok("Removed member from team successfully");
    }
}
