package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.IncidentAction;
import lombok.Data;

import java.util.List;

@Data
public class ResolveIncidentRequest {
    private IncidentAction action;
    private String coordinatorResponse;

    // --- ABORT without reassign: where to put the old vehicle ---
    // "AVAILABLE" = return to ready, "MAINTENANCE" = send for repair
    private String vehicleStatus;

    // --- ABORT with reassign ---
    private Long newTeamId;       // RescueTeam ID of the new team
    private Long newVehicleId;    // Optional: new vehicle to give to the new team
    private List<AssignSupplyDTO> newSupplies; // Optional: supplies to allocate to new team
}
