package com.team6.floodcoord.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class RescueRequestSummaryResponse {

    private UUID requestId;
    private String trackingCode;
    private String title;
    private String emergencyLevel;
    private String status;
    private int peopleCount;
    private LocalDateTime createdAt;

    private String contactName;
    private String contactPhone;

    // Thông tin đội đã phân công (dùng để hiển thị trong danh sách)
    private Long assignedTeamId;
    private String assignedTeamName;
    
}