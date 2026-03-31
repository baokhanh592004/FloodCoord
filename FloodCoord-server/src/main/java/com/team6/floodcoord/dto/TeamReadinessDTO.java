package com.team6.floodcoord.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeamReadinessDTO {
    private long totalTeams;
    private long availableCount;
    private long busyCount;
    private long offDutyCount;
}
