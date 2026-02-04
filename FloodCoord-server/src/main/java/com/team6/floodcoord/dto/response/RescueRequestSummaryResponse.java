package com.team6.floodcoord.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

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