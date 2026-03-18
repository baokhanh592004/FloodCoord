package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompletedRequestDTO {

    private UUID requestId;

    private String trackingCode;

    private String title;

    private String emergencyLevel;

    private String contactName;

    private String contactPhone;

    private String description;

    private Integer peopleCount;

    private RequestStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    private String citizenFeedback;

    private Integer citizenRating;

    private RequestLocationResponse location;

    private List<RequestMediaResponse> media;

    private VehicleResponse vehicle;

    private List<AssignedSupplyResponse> supplies;
    private Long assignedTeamId;
    private String assignedTeamName;
    private String assignedTeamLeaderPhone;

    private ReportDetailDTO report;

}