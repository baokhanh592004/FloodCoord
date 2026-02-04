package com.team6.floodcoord.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class AssignTaskRequest {
    private Long rescueTeamId;          // Bắt buộc
    private Long vehicleId;             // Tùy chọn (có thể null)
    private List<AssignSupplyDTO> supplies; // Tùy chọn
    private String note;                // Ghi chú chỉ đạo
    private String emergencyLevel;      // Update lại mức độ khẩn cấp nếu cần
}
