package com.team6.floodcoord.repository.jpa;


import com.team6.floodcoord.model.WeatherSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherSnapshotRepository extends JpaRepository<WeatherSnapshot, Long> {

    /** Latest N snapshots for a location - for trend charts on the frontend */
    List<WeatherSnapshot> findTop24ByLatitudeAndLongitudeOrderByRecordedAtDesc(
            Double latitude, Double longitude);

    /** All snapshots within a time range for a location */
    @Query("SELECT w FROM WeatherSnapshot w " +
           "WHERE w.latitude = :lat AND w.longitude = :lon " +
            "AND w.recordedAt BETWEEN :from AND :to " +
            "ORDER BY w.recordedAt ASC")
    List<WeatherSnapshot> findByLocationAndTimeRange(
            @Param("lat") Double latitude,
            @Param("lon") Double longitude,
            @Param("from")LocalDateTime from,
            @Param("to") LocalDateTime to);

    /** All CRITICAL or HIGH snapshots in the last N hours - for alert history */
    @Query("SELECT w FROM WeatherSnapshot w " +
           "WHERE w.riskLevel IN ('CRITICAL', 'HIGH') " +
            "AND w.recordedAt >= :since " +
    "ORDER BY w.recordedAt DESC")
    List<WeatherSnapshot> findHighRiskSince(@Param("since") LocalDateTime since);

    WeatherSnapshot findTopByLatitudeAndLongitudeOrderByRecordedAtDesc(
            Double latitude, Double longitude);
}
