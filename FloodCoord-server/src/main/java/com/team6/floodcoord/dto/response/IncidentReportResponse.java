package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.IncidentAction;
import com.team6.floodcoord.model.enums.IncidentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class IncidentReportResponse {
    private Long id;

    // Thông tin nhiệm vụ và đội
    private UUID rescueRequestId;
    private String rescueRequestTitle;
    private String teamName;

    // Thông tin người báo cáo (Leader)
    private String reportedByName;
    private String reportedByPhone;

    // Nội dung sự cố
    private String title;
    private String description;
    private List<String> images;
    private IncidentStatus status;
    private LocalDateTime createdAt;

    // Kết quả xử lý
    private String coordinatorResponse;
    private IncidentAction coordinatorAction;
    private Boolean isPostDeparture;   // true = đội đã xuất phát khi sự cố → OFF_DUTY + MAINTENANCE
    private LocalDateTime resolvedAt;
}
