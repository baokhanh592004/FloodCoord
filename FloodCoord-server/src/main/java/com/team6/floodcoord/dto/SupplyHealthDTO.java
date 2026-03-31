package com.team6.floodcoord.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupplyHealthDTO {
    private long totalSupplyTypes;
    private long lowStockCount;
    private long outOfStockCount;
}
