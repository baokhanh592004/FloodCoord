package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.RiskLevelDTO;
import com.team6.floodcoord.model.enums.RiskLevel;
import com.team6.floodcoord.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Pre-warms Redis cache for flood-prone Vietnamese locations every 30 minutes.
 * This ensures rescue coordinators always get sub-100ms responses from cache,
 * even if they query at the same time as a flood event starts.
 *
 * Toggle on/off via: weather.scheduler.enabled=true|false
 */
@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class WeatherPollingScheduler {

    private final AlertService alertService;

    @Value("${weather.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    /**
     * Key flood-prone and rescue-relevant locations across Vietnam.
     * Format: { lat, lon, "name" (for logging only) }
     */
    private static final List<double[]> MONITORED_LOCATIONS = List.of(
            // Central Vietnam — most flood-prone region
            new double[]{16.047, 108.206},   // Da Nang
            new double[]{16.463, 107.585},   // Hue
            new double[]{15.880, 108.335},   // Hoi An
            new double[]{14.058, 108.278},   // Kon Tum

            // Southern Vietnam — Mekong Delta
            new double[]{10.823, 106.630},   // Ho Chi Minh City
            new double[]{10.045, 105.746},   // Can Tho
            new double[]{10.370, 105.438},   // Long Xuyen
            new double[]{10.539, 106.413},   // My Tho

            // Northern Vietnam
            new double[]{21.028, 105.834},   // Hanoi
            new double[]{20.844, 106.688},   // Hai Phong

            // North Central Coast
            new double[]{18.679, 105.681},   // Vinh
            new double[]{17.467, 106.622}    // Dong Hoi
    );

    /**
     * Runs every 30 minutes. Fetches weather + flood + risk for all locations.
     * Results are stored in Redis automatically by WeatherService / FloodService.
     */
    @Scheduled(fixedDelayString = "${weather.cache.ttl-minutes:30}000",
            initialDelay = 10000)  // 10s delay on startup to let context load
    public void pollAllLocations() {
        if (!schedulerEnabled) {
            log.debug("Weather polling scheduler is disabled");
            return;
        }

        log.info("Starting weather poll cycle for {} locations",
                MONITORED_LOCATIONS.size());
        int success = 0;
        int failed  = 0;

        for (double[] loc : MONITORED_LOCATIONS) {
            try {
                RiskLevelDTO risk = alertService.evaluateRisk(loc[0], loc[1]);
                log.info("Polled [{},{}] → risk={}, discharge={}m³/s, rain={}mm",
                        loc[0], loc[1],
                        risk.getRiskLevel(),
                        risk.getRiverDischarge(),
                        risk.getCurrentPrecipitation());

                if (risk.getRiskLevel() == RiskLevel.CRITICAL
                        || risk.getRiskLevel() == RiskLevel.HIGH) {
                    log.warn("ALERT: {} risk detected at [{},{}] — {}",
                            risk.getRiskLevel(), loc[0], loc[1],
                            risk.getRecommendation());
                }
                success++;
            } catch (Exception e) {
                log.error("Poll failed for [{},{}]: {}", loc[0], loc[1], e.getMessage());
                failed++;
            }
        }

        log.info("Weather poll cycle complete: {}/{} succeeded, {} failed",
                success, MONITORED_LOCATIONS.size(), failed);
    }
}