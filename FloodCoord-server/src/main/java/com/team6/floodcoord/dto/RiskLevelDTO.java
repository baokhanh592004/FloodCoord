package com.team6.floodcoord.dto;

import com.team6.floodcoord.model.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskLevelDTO {
    private Double latitude;
    private Double longitude;
    private RiskLevel riskLevel;
    private String recommendation;

    //Raw values used to compute risk (useful for frontend display)
    private Double riverDischarge;
    private Double maxForecastDischarge;
    private Double currentPrecipitation;
    private  Double currentTemperature;
    private Double windSpeed;

    private LocalDateTime evaluatedAt;
    private String cacheUntil;
}
