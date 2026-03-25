package com.team6.floodcoord.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleStatDTO {
    private long availableCount;
    private long inUseCount;
    private long maintenanceCount;
    private long totalCount;
}
