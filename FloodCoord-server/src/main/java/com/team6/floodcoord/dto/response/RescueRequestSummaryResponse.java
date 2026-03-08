package com.team6.floodcoord.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class RescueRequestSummaryResponse {

    private UUID requestId;
    private String title;
    private String emergencyLevel;
    private String status;
    private int peopleCount;
    private LocalDateTime createdAt;

    private String contactName;
    private String contactPhone;
    
}