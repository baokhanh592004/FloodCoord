package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.WeatherCurrentDTO;
import com.team6.floodcoord.dto.WeatherForecastDTO;
import com.team6.floodcoord.model.WeatherSnapshot;
import com.team6.floodcoord.repository.WeatherSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {
    private final CacheService cacheService;
    private final WeatherSnapshotRepository snapshotRepository;
    private final RestClient restClient = RestClient.create();

    @Value("${weather.open-meteo.forecast-url}")
    private String forecastUrl;

    @Value("${weather.cache.ttl-minutes:30}")
    private long ttlMinutes;

    // ─── Public API ────────────────────────────────────────────────────────────

    public WeatherCurrentDTO getCurrentWeather(double lat, double lon) {
        String key = cacheService.weatherCurrentKey(lat, lon);
        return cacheService.getOrFetch(
                key,
                Duration.ofMinutes(ttlMinutes),
                () -> fetchCurrentFromAPI(lat, lon),
                WeatherCurrentDTO.class
        );
    }

    public WeatherForecastDTO getForecast(double lat, double lon, int days) {
        String key = cacheService.weatherForecastKey(lat, lon, days);
        return cacheService.getOrFetch(
                key,
                Duration.ofHours(1),
                () -> fetchForecastFromAPI(lat, lon, days),
                WeatherForecastDTO.class
        );
    }

    // ─── Private API callers ───────────────────────────────────────────────────

    private WeatherCurrentDTO fetchCurrentFromAPI(double lat, double lon) {
        // FIX 2: UriComponentsBuilder replaces String.format URL construction.
        // String.format with %%2F produced a corrupted URL that Open-Meteo
        // rejected with 400 Bad Request. UriComponentsBuilder correctly encodes
        // "Asia/Ho_Chi_Minh" as "Asia%2FHo_Chi_Minh" in the final URI.
        URI uri = UriComponentsBuilder
                .fromHttpUrl(forecastUrl)
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("current",
                        "temperature_2m,relative_humidity_2m,apparent_temperature," +
                                "precipitation,rain,wind_speed_10m,wind_direction_10m," +
                                "wind_gusts_10m,weather_code,cloud_cover")
                .queryParam("timezone", "Asia/Ho_Chi_Minh")
                .build(true)
                .toUri();

        log.info("Fetching current weather: {}", uri);

        try {
            WeatherCurrentDTO result = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(WeatherCurrentDTO.class);

            if (result != null) {
                saveSnapshotAsync(lat, lon, result);
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to fetch current weather for [{},{}]: {}", lat, lon, e.getMessage());
            return null;
        }
    }

    private WeatherForecastDTO fetchForecastFromAPI(double lat, double lon, int days) {
        URI uri = UriComponentsBuilder
                .fromHttpUrl(forecastUrl)
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("hourly",
                        "temperature_2m,relative_humidity_2m,precipitation_probability," +
                                "precipitation,rain,wind_speed_10m,wind_gusts_10m,weather_code")
                .queryParam("forecast_days", days)
                .queryParam("timezone", "Asia/Ho_Chi_Minh")
                .build(true)
                .toUri();

        log.info("Fetching {}-day forecast: {}", days, uri);

        try {
            return restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(WeatherForecastDTO.class);
        } catch (Exception e) {
            log.error("Failed to fetch forecast for [{},{}]: {}", lat, lon, e.getMessage());
            return null;
        }
    }

    // ─── Async snapshot persistence ────────────────────────────────────────────

    @Async
    public void saveSnapshotAsync(double lat, double lon, WeatherCurrentDTO dto) {
        try {
            WeatherCurrentDTO.CurrentBlock cur = dto.getCurrent();
            if (cur == null) return;

            WeatherSnapshot snapshot = WeatherSnapshot.builder()
                    .latitude(lat)
                    .longitude(lon)
                    .temperature(cur.getTemperature2m())
                    .humidity(cur.getRelativeHumidity2m())
                    .precipitation(cur.getPrecipitation())
                    .rain(cur.getRain())
                    .windSpeed(cur.getWindSpeed10m())
                    .windGusts(cur.getWindGusts10m())
                    .weatherCode(cur.getWeatherCode())
                    .recordedAt(LocalDateTime.now())
                    .build();

            snapshotRepository.save(snapshot);
        } catch (Exception e) {
            log.warn("Failed to save weather snapshot: {}", e.getMessage());
        }
    }
}
