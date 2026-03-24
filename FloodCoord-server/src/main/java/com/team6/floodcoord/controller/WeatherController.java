package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.FloodDischargeDTO;
import com.team6.floodcoord.dto.RiskLevelDTO;
import com.team6.floodcoord.dto.WeatherCurrentDTO;
import com.team6.floodcoord.dto.WeatherForecastDTO;
import com.team6.floodcoord.model.WeatherSnapshot;
import com.team6.floodcoord.repository.jpa.WeatherSnapshotRepository;
import com.team6.floodcoord.service.AlertService;
import com.team6.floodcoord.service.CacheService;
import com.team6.floodcoord.service.FloodService;
import com.team6.floodcoord.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST endpoints for the weather/flood module.
 * All coordinates use decimal degrees (WGS84).
 *
 * Base URL: /api/weather  and  /api/flood
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;
    private final FloodService floodService;
    private final AlertService alertService;
    private final CacheService cacheService;
    private final WeatherSnapshotRepository snapshotRepository;

    // ─── Weather endpoints ─────────────────────────────────────────────────────

    /**
     * GET /api/weather/current?lat=10.82&lon=106.63
     * Returns current temperature, rain, wind, humidity for a location.
     */
    @GetMapping("/weather/current")
    public ResponseEntity<WeatherCurrentDTO> getCurrentWeather(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(weatherService.getCurrentWeather(lat, lon));
    }

    /**
     * GET /api/weather/forecast?lat=10.82&lon=106.63&days=7
     * Returns hourly forecast up to 16 days (default 7).
     */
    @GetMapping("/weather/forecast")
    public ResponseEntity<WeatherForecastDTO> getForecast(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "7") int days) {
        if (days < 1 || days > 16) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(weatherService.getForecast(lat, lon, days));
    }

    // ─── Flood endpoints ───────────────────────────────────────────────────────

    /**
     * GET /api/flood/discharge?lat=10.82&lon=106.63
     * Returns river discharge (m³/s) for up to 16 days from GloFAS model.
     */
    @GetMapping("/flood/discharge")
    public ResponseEntity<FloodDischargeDTO> getRiverDischarge(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(floodService.getRiverDischarge(lat, lon));
    }

    /**
     * GET /api/flood/risk?lat=10.82&lon=106.63
     * Returns computed risk level (LOW/MEDIUM/HIGH/CRITICAL) with rescue recommendation.
     * Combines current weather + river discharge into actionable alert.
     */
    @GetMapping("/flood/risk")
    public ResponseEntity<RiskLevelDTO> getRiskLevel(
            @RequestParam double lat,
            @RequestParam double lon) {
        return ResponseEntity.ok(alertService.evaluateRisk(lat, lon));
    }

    // ─── History endpoints ─────────────────────────────────────────────────────

    /**
     * GET /api/weather/history?lat=10.82&lon=106.63
     * Returns last 24 stored snapshots for trend analysis.
     */
    @GetMapping("/weather/history")
    public ResponseEntity<List<WeatherSnapshot>> getHistory(
            @RequestParam double lat,
            @RequestParam double lon) {
        List<WeatherSnapshot> snapshots = snapshotRepository
                .findTop24ByLatitudeAndLongitudeOrderByRecordedAtDesc(lat, lon);
        return ResponseEntity.ok(snapshots);
    }

    /**
     * GET /api/weather/alerts?hours=24
     * Returns all HIGH/CRITICAL snapshots across all locations in the last N hours.
     * Used by rescue coordinators to see active alert zones.
     */
    @GetMapping("/weather/alerts")
    public ResponseEntity<List<WeatherSnapshot>> getActiveAlerts(
            @RequestParam(defaultValue = "24") int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return ResponseEntity.ok(snapshotRepository.findHighRiskSince(since));
    }

    // ─── Cache management endpoints ────────────────────────────────────────────

    /**
     * DELETE /api/cache/evict?lat=10.82&lon=106.63
     * Force-refresh cache for a location. Use during active emergencies.
     */
    @DeleteMapping("/cache/evict")
    public ResponseEntity<Map<String, String>> evictLocation(
            @RequestParam double lat,
            @RequestParam double lon) {
        cacheService.evictLocation(lat, lon);
        return ResponseEntity.ok(Map.of(
                "status", "evicted",
                "location", lat + "," + lon,
                "message", "Cache cleared. Next request will fetch live data."
        ));
    }

    /**
     * DELETE /api/cache/evict/all
     * Evict all weather/flood caches. Use only when data integrity is suspected.
     */
    @DeleteMapping("/cache/evict/all")
    public ResponseEntity<Map<String, String>> evictAll() {
        cacheService.evictAll();
        return ResponseEntity.ok(Map.of("status", "all caches evicted"));
    }

    /**
     * GET /api/cache/status
     * Health check — confirms Redis is reachable.
     */
    @GetMapping("/cache/status")
    public ResponseEntity<Map<String, Object>> cacheStatus() {
        return ResponseEntity.ok(Map.of(
                "redisAvailable", cacheService.isRedisAvailable(),
                "checkedAt", LocalDateTime.now().toString()
        ));
    }
}