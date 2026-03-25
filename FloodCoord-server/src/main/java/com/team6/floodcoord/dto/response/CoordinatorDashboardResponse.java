package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CoordinatorDashboardResponse {
    private MonthlyStatDTO resolvedRequests;
    private MonthlyStatDTO incidentReports;
    private MonthlyStatDTO supplyUsage;
}
