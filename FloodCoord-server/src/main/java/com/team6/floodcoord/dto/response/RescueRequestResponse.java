package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RescueRequestResponse {
    private UUID id;
    private String trackingCode;
    private RequestStatus status;     // QUAN TRỌNG: Để dân biết (PENDING, MOVING, ARRIVED...)
    private String title;
    private String description;

    // Thông tin Đội cứu hộ (Nếu đã được gán)
    private String assignedTeamName;
    private String assignedTeamPhone; // SĐT đội trưởng (để dân liên lạc nếu cần)

    // Ghi chú tiến độ (Để dân đọc: "Đội đang cách 500m")
    private String coordinatorNote;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
