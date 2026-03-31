package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.dto.SupplyHealthDTO;
import com.team6.floodcoord.dto.TeamReadinessDTO;
import com.team6.floodcoord.dto.VehicleFleetDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerDashboardResponse {
    private TeamReadinessDTO teamReadiness;
    private VehicleFleetDTO vehicleFleet;
    private SupplyHealthDTO supplyHealth;
}
