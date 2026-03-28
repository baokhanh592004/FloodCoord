package com.team6.floodcoord.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MonthlyDoubleStatDTO {
    private double currentMonthValue;
    private double lastMonthValue;
    private double growthRate;
}
