package com.team6.floodcoord.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CreateRequestResponse {
    private UUID requestId;
    private String trackingCode;
}
