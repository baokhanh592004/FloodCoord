package com.team6.floodcoord.dto.request;

import lombok.Data;

@Data
public class LocationDTO {
    private Double latitude;
    private Double longitude;
    private String addressText;
    private Float floodDepth;
}
