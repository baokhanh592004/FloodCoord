package com.team6.floodcoord.dto.request;

import lombok.Data;

import java.util.List;

/**
 * DTO để giao nhiệm vụ cho đội mới sau khi đã ABORT incident.
 * Được sử dụng trong API: POST /api/incidents/{id}/assign-team
 */
@Data
public class AssignTeamRequest {
    private Long newTeamId;              // Đội sẽ nhận nhiệm vụ
    private Long newVehicleId;           // Phương tiện giao cho đội (optional)
    private List<AssignSupplyDTO> newSupplies;  // Vật tư giao cho đội (optional)
}
