package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class CompletedRequestDTO {

    private UUID id;

    private String trackingCode;

    private Double latitude;
    private Double longitude;
    private String address;
    private Float floodDepth;


    private String description;

    private Integer peopleCount;

    private RequestStatus status;

}