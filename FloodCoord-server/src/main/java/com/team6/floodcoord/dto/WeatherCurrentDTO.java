package com.team6.floodcoord.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class WeatherCurrentDTO {
    private Double latitude;
    private Double longitude;
    private String timezone;

    @JsonProperty("current")
    private CurrentBlock current;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CurrentBlock {
        @JsonProperty("time")
        private String time;

        @JsonProperty("temperature_2m")
        private Double temperature2m;

        @JsonProperty("relative_humidity_2m")
        private Integer relativeHumidity2m;

        @JsonProperty("apparent_temperature")
        private Double apparentTemperature;

        @JsonProperty("precipitation")
        private Double precipitation;

        @JsonProperty("rain")
        private Double rain;

        @JsonProperty("wind_speed_10m")
        private Double windSpeed10m;

        @JsonProperty("wind_gusts_10m")
        private Double windGusts10m;

        @JsonProperty("wind_direction_10m")
        private Integer windDirection10m;

        @JsonProperty("weather_code")
        private Integer weatherCode;

        @JsonProperty("cloud_cover")
        private Integer cloudCover;
    }
}
