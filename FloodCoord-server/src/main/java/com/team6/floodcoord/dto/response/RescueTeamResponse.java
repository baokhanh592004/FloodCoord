package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.TeamStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RescueTeamResponse {
    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private TeamStatus status;

    // Thông tin tóm tắt về leader
    private String leaderName;
    private Long leaderId;

    // Danh sách thành viên chi tiết
    private List<UserResponse> members;
}
