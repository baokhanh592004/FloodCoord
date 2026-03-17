package com.team6.floodcoord.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherForecastDTO {
    private Double latitude;
    private Double longitude;
    private String timezone;

    @JsonProperty("hourly")
    private HourlyBlock hourly;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HourlyBlock {
        @JsonProperty("temperature_2m")
        private List<Double> temperature2m;

        @JsonProperty("time")
        private List<String> time;

        @JsonProperty("relative_humidity_2m")
        private List<Integer> relativeHumidity2m;

        @JsonProperty("precipitation_probability")
        private List<Integer> precipitationProbability;

        @JsonProperty("precipitation")
        private List<Double> precipitation;

        @JsonProperty("rain")
        private List<Double> rain;

        @JsonProperty("wind_speed_10m")
        private List<Double> windSpeed10m;

        @JsonProperty("wind_gusts_10m")
        private List<Double> windGusts10m;

        @JsonProperty("weather_code")
        private List<Integer> weatherCode;
    }
}
