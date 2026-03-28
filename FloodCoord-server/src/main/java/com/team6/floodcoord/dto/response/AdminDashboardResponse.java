package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import com.team6.floodcoord.dto.VehicleStatDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private MonthlyStatDTO newUsers;
    private MonthlyStatDTO rescueRequests;
    private VehicleStatDTO vehicles;
}
