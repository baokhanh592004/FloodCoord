package com.team6.floodcoord.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RequestMediaResponse {
    private UUID mediaId;
    private String mediaType;
    private String mediaUrl;
    private LocalDateTime uploadedAt;
}

