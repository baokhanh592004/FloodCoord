package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.IncidentAction;
import lombok.Data;

import java.util.List;

@Data
public class ResolveIncidentRequest {
    private IncidentAction action;
    private String coordinatorResponse;

    /**
     * true = đội đã xuất phát khi sự cố xảy ra (post-departure).
     * Khi true + ABORT: đội cũ → OFF_DUTY, xe cũ → MAINTENANCE, vật tư KHÔNG hoàn lại kho.
     * Đội cũ phải gửi báo cáo tình trạng xe/vật tư sau khi về.
     */
    private Boolean isPostDeparture;


    // --- ABORT with reassign ---
    private Long newTeamId;       // RescueTeam ID of the new team
    private Long newVehicleId;    // Optional: new vehicle to give to the new team
    private List<AssignSupplyDTO> newSupplies; // Optional: supplies to allocate to new team
}
