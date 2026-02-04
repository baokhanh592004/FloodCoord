package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AssignTaskRequest;
import com.team6.floodcoord.dto.request.AssignTaskRequest;
import com.team6.floodcoord.dto.request.RescueTeamRequest;
import com.team6.floodcoord.dto.response.RescueTeamResponse;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.User;

import java.util.List;
import java.util.UUID;
import java.util.UUID;

public interface RescueTeamService {
    RescueTeamResponse createTeam(RescueTeamRequest request);
    RescueTeamResponse updateTeam(Long id, RescueTeamRequest request);
    RescueTeamResponse getTeamById(Long id);
    List<RescueTeamResponse> getAllTeams();
    void deleteTeam(Long id); // Xóa mềm hoặc xóa cứng tùy logic
    void removeMemberFromTeam(Long teamId, Long userId);
}
