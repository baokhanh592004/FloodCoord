package com.team6.floodcoord.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateRescueRequestDTO {
    private String title;
    private String description;
    private String emergencyLevel;
    private int peopleCount;
    private LocationDTO location;
    private List<MediaDTO> mediaUrls;
}

