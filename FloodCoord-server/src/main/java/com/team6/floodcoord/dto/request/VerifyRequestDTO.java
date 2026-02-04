package com.team6.floodcoord.dto.request;

import lombok.Data;

@Data
public class VerifyRequestDTO {
    private String emergencyLevel;
    private String note;
}
