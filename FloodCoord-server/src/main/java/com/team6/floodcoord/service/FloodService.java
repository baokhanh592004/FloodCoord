package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.FloodDischargeDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class FloodService {

    private final CacheService cacheService;
    private final RestClient restClient = RestClient.create();

    @Value("${weather.open-meteo.flood-url}")
    private String floodUrl;

    @Value("${weather.cache.ttl-minutes:30}")
    private long ttlMinutes;

    // ─── Public API ────────────────────────────────────────────────────────────

    public FloodDischargeDTO getRiverDischarge(double lat, double lon) {
        String key = cacheService.floodDischargeKey(lat, lon);
        return cacheService.getOrFetch(
                key,
                Duration.ofMinutes(ttlMinutes),
                () -> fetchWithFallback(lat, lon),
                FloodDischargeDTO.class
        );
    }

    // ─── Private fetcher with coordinate nudging ───────────────────────────────

    /**
     * GloFAS has 5 km resolution — if no river is found at exact coordinates,
     * we nudge by ±0.05° in four directions and retry.
     */

    private boolean isValid(FloodDischargeDTO dto) {
        return dto != null && dto.getLatestDischarge() != null && dto.getLatestDischarge() > 0;
    }

    private FloodDischargeDTO fetchWithFallback(double lat, double lon) {
        FloodDischargeDTO result = fetchFromAPI(lat, lon);

        if (isValid(result)) {
            return result;
        }

        log.warn("No river data at [{},{}] — trying coordinate nudges", lat, lon);
        double[][] nudges = {
                {lat + 0.05, lon},
                {lat - 0.05, lon},
                {lat, lon + 0.05},
                {lat, lon - 0.05}
//                {lat + 0.05, lon},
//                {lat, lon + 0.05}
        };

        for (double[] nudge : nudges) {
            FloodDischargeDTO nudged = fetchFromAPI(nudge[0], nudge[1]);

            if (isValid(nudged)) {
                log.info("River data found at nudged coords [{},{}]",
                        nudge[0], nudge[1]);
                return nudged;
            }
        }

        log.warn("No river discharge data found near [{},{}]", lat, lon);
        return new FloodDischargeDTO();
    }

    private FloodDischargeDTO fetchFromAPI(double lat, double lon) {
        // UriComponentsBuilder for correct URL construction
        URI uri = UriComponentsBuilder
                .fromHttpUrl(floodUrl)
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("daily",
                        "river_discharge,river_discharge_max,river_discharge_median")
                .queryParam("forecast_days", 16)
                .build(true)
                .toUri();

        try {
            log.info("Fetching river discharge: {}", uri);
             FloodDischargeDTO respone = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(FloodDischargeDTO.class);
             return respone != null ? respone : new FloodDischargeDTO();
        } catch (RestClientException e) {
            log.error("Flood API error for [{},{}]: {}", lat, lon, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Flood API call failed for [{},{}]: {}", lat, lon, e.getMessage());
            return new FloodDischargeDTO();
        }
    }
}
