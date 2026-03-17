package com.team6.floodcoord.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FloodDischargeDTO {
    private Double latitude;
    private Double longitude;
    private String timezone;

    @JsonProperty("daily")
    private DailyBlock daily;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DailyBlock {
        @JsonProperty("time")
        private List<String> time;

        /** River discharge in m³/s */
        @JsonProperty("river_discharge")
        private List<Double> riverDischarge;

        /** Max ensemble discharge - useful for worst-case planning */
        @JsonProperty("river_discharge_max")
        private List<Double> riverDischargeMax;

        /** Median discharge across ensemble members */
        @JsonProperty("river_discharge_median")
        private List<Double> riverDischargeMedian;
    }

    /** Convenience: returns today's discharge (first element) */
    public Double getLatestDischarge() {
        if (daily == null || daily.getRiverDischarge() == null
                || daily.getRiverDischarge().isEmpty()) {
            return 0.0;
        }
        return daily.getRiverDischarge().get(0);
    }

    /** Convenience: max discharge over the forecast window */
    public Double getMaxForecastDischarge() {
        if(daily == null || daily.getRiverDischargeMax() == null
                || daily.getRiverDischargeMax().isEmpty()) {
            return 0.0;
        }
        return daily.getRiverDischargeMax().stream()
                .filter(v -> v != null)
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0.0);
    }
}
