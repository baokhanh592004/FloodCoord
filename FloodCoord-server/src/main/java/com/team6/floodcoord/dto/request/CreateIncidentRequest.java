package com.team6.floodcoord.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Data
public class CreateIncidentRequest {
    private UUID rescueRequestId;
    private String title;
    private String description;
    private MultipartFile[] files;
}
