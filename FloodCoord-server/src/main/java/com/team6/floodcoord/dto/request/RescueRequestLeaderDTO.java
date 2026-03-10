package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.dto.response.RequestLocationResponse;
import com.team6.floodcoord.dto.response.RequestMediaResponse;
import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class RescueRequestLeaderDTO {

    private UUID requestId;
    private String title;
    private String emergencyLevel;
    private RequestStatus status;
    private String contactName;
    private String contactPhone;
    private LocalDateTime createdAt;
    private String description;
    private Integer peopleCount;

    private RequestLocationResponse location;
    private List<RequestMediaResponse> media;
}
