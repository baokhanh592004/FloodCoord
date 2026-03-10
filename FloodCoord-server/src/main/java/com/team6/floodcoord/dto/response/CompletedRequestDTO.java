package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CompletedRequestDTO {

    private UUID id;

    private String trackingCode;

    private String title;

    private Double latitude;
    private Double longitude;
    private String address;
    private Float floodDepth;

    private String description;

    private Integer peopleCount;

    private RequestStatus status;

    private LocalDateTime completedAt;

    private String citizenFeedback;

    private Integer citizenRating;

}