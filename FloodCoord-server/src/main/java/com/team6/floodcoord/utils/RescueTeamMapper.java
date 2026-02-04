package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.response.RescueTeamResponse;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.RescueTeam;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class RescueTeamMapper {
    // Private constructor để ngăn chặn việc khởi tạo class này (vì đây là utility class)
    private RescueTeamMapper() {}

    public static RescueTeamResponse mapToResponse(RescueTeam team) {
        if (team == null) return null;

        Long leaderId = (team.getLeader() != null) ? team.getLeader().getId() : null;
        String leaderName = (team.getLeader() != null) ? team.getLeader().getFullName() : null;

        List<UserResponse> memberResponses = new ArrayList<>();
        if (team.getMembers() != null) {
            memberResponses = team.getMembers().stream().map(user -> {
                // LOGIC QUAN TRỌNG: Xác định isTeamLeader
                boolean isLeader = (leaderId != null && user.getId().equals(leaderId));

                return UserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .phoneNumber(user.getPhoneNumber())
                        .status(user.getStatus())
                        .roleName(user.getRole() != null ? user.getRole().getRoleCode() : null)
                        .teamId(team.getId())         // Map thêm thông tin Team
                        .teamName(team.getName())     // Map thêm thông tin Team
                        .isTeamLeader(isLeader)       // Set cờ Leader
                        .build();
            }).collect(Collectors.toList());
        }

        return RescueTeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .isActive(team.getIsActive())
                .leaderId(leaderId)
                .leaderName(leaderName)
                .members(memberResponses)
                .build();
    }
}
