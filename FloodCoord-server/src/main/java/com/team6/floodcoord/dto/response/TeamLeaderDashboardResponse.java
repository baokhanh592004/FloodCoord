package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamLeaderDashboardResponse {
    private MonthlyStatDTO completedMissions;
    private MonthlyStatDTO rescuedPeople;
    private MonthlyDoubleStatDTO averageRating;
}
