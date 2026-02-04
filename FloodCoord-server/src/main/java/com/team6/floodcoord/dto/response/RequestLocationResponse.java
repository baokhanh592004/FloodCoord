package com.team6.floodcoord.dto.response;

import lombok.Data;

@Data
public class RequestLocationResponse {
    private Double latitude;
    private Double longitude;
    private String addressText;
    private Float floodDepth;
}

