package com.team6.floodcoord.model;

import com.team6.floodcoord.model.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Persists of weather+flood snapshot every 30 minutes per monitored location.
 * Used for historical analysis and rescue planning trend views.
 */
@Entity
@Table(name = "weather_snapshots", indexes = {
        @Index(name = "idx_weather_snapshot_location",
        columnList = "latitude, longitude"),
        @Index(name = "idx_weather_snapshot_recorded_at",
        columnList = "recorded_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    //Weather fields
    private Double temperature;
    private Integer humidity;
    private Double precipitation;
    private Double rain;
    private Double windSpeed;
    private Double windGusts;
    private Integer weatherCode;

    //Flood fields
    private Double riverDischarge;
    private Double riverDischargeMax;

    //Computed risk
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RiskLevel riskLevel;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;
}
