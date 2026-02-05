package com.team6.floodcoord.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class RescueRequestDetailResponse {

    private UUID requestId;
    private String title;
    private String description;
    private String emergencyLevel;
    private String status;
    private int peopleCount;
    private LocalDateTime createdAt;

    private String citizenName;

    private RequestLocationResponse location;
    private List<RequestMediaResponse> media;
}
