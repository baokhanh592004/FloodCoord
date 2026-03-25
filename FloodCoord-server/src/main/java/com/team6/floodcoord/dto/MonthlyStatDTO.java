package com.team6.floodcoord.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MonthlyStatDTO {
    private long currentMonthValue;
    private long lastMonthValue;
    private double growthRate;
}
