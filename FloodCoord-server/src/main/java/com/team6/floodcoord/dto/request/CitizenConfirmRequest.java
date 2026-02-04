package com.team6.floodcoord.dto.request;

import lombok.Data;

@Data
public class CitizenConfirmRequest {
    private String trackingCode;
    private String feedback;
    private Integer rating;
}
