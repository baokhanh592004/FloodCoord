package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.FloodDischargeDTO;
import com.team6.floodcoord.dto.RiskLevelDTO;
import com.team6.floodcoord.dto.WeatherCurrentDTO;
import com.team6.floodcoord.model.WeatherSnapshot;
import com.team6.floodcoord.model.enums.RiskLevel;
import com.team6.floodcoord.repository.jpa.WeatherSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final WeatherService weatherService;
    private final FloodService floodService;
    private final CacheService cacheService;
    private final WeatherSnapshotRepository snapshotRepository;

    // ─── Vietnamese flood thresholds ───────────────────────────────────────────
    // Tuned for Vietnam river systems (Mekong, Red River, Thu Bon, etc.)
    private static final double DISCHARGE_CRITICAL = 5000.0; // m³/s
    private static final double DISCHARGE_HIGH     = 2000.0;
    private static final double DISCHARGE_MEDIUM   = 800.0;

    private static final double RAIN_24H_CRITICAL  = 200.0;  // mm
    private static final double RAIN_24H_HIGH      = 100.0;
    private static final double RAIN_24H_MEDIUM    = 50.0;

    private static final double WIND_CRITICAL      = 90.0;   // km/h (typhoon)
    private static final double WIND_HIGH          = 62.0;   // km/h (strong storm)

    // ─── Public API ────────────────────────────────────────────────────────────

    public RiskLevelDTO evaluateRisk(double lat, double lon) {
        WeatherCurrentDTO weather = weatherService.getCurrentWeather(lat, lon);
        FloodDischargeDTO flood   = floodService.getRiverDischarge(lat, lon);

        double discharge   = (flood != null && flood.getLatestDischarge() != null)
                ? flood.getLatestDischarge() : 0.0;
        double maxDischarge = (flood != null && flood.getMaxForecastDischarge() != null)
                ? flood.getMaxForecastDischarge() : 0.0;
        double rain        = extractRain(weather);
        double wind        = extractWind(weather);
        double temp        = extractTemp(weather);

        RiskLevel level = computeRiskLevel(discharge, rain, wind);
        String recommendation        = buildRecommendation(level);

        log.info("Risk evaluated [{},{}]: {} (discharge={}, rain={}, wind={})",
                lat, lon, level, discharge, rain, wind);

        // Persist to snapshot
        persistRiskSnapshot(lat, lon, weather, flood, level);

        return RiskLevelDTO.builder()
                .latitude(lat)
                .longitude(lon)
                .riskLevel(level)
                .recommendation(recommendation)
                .riverDischarge(discharge)
                .maxForecastDischarge(maxDischarge)
                .currentPrecipitation(rain)
                .currentTemperature(temp)
                .windSpeed(wind)
                .evaluatedAt(LocalDateTime.now())
                .build();
    }

    // ─── Risk computation ──────────────────────────────────────────────────────

    private RiskLevel computeRiskLevel(double discharge,
                                                    double rain,
                                                    double wind) {
        if (discharge >= DISCHARGE_CRITICAL
                || rain >= RAIN_24H_CRITICAL
                || wind >= WIND_CRITICAL) {
            return RiskLevel.CRITICAL;
        }
        if (discharge >= DISCHARGE_HIGH
                || rain >= RAIN_24H_HIGH
                || wind >= WIND_HIGH) {
            return RiskLevel.HIGH;
        }
        if (discharge >= DISCHARGE_MEDIUM || rain >= RAIN_24H_MEDIUM) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }

    private String buildRecommendation(RiskLevel level) {
        return switch (level) {
            case CRITICAL -> "TRIỂN KHAI NGAY LẬP TỨC CÁC ĐỘI CỨU HỘ. Sơ tán tất cả các khu vực trũng thấp. " +
                    "Liên hệ trung tâm điều phối khẩn cấp.";
            case HIGH     -> "Bố trí sẵn các đội cứu hộ tại các khu vực tập kết. " +
                    "Phát cảnh báo sơ tán. Giám sát liên tục.";
            case MEDIUM   -> "Chuẩn bị sẵn sàng các nguồn lực cứu hộ. " +
                    "Thông báo cho chính quyền địa phương. Tăng tần suất giám sát.";
            case LOW      -> "Thời tiết bình thường. Không cần hành động ngay lúc này.";
        };
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private double extractRain(WeatherCurrentDTO dto) {
        if (dto == null || dto.getCurrent() == null) return 0.0;
        Double rain = dto.getCurrent().getRain();
        return rain != null ? rain : 0.0;
    }

    private double extractWind(WeatherCurrentDTO dto) {
        if (dto == null || dto.getCurrent() == null) return 0.0;
        Double wind = dto.getCurrent().getWindSpeed10m();
        return wind != null ? wind : 0.0;
    }

    private double extractTemp(WeatherCurrentDTO dto) {
        if (dto == null || dto.getCurrent() == null) return 0.0;
        Double temp = dto.getCurrent().getTemperature2m();
        return temp != null ? temp : 0.0;
    }

    private void persistRiskSnapshot(double lat, double lon,
                                     WeatherCurrentDTO weather,
                                     FloodDischargeDTO flood,
                                     RiskLevel level) {
        try {
//            WeatherSnapshot snap = snapshotRepository
//                    .findTop24ByLatitudeAndLongitudeOrderByRecordedAtDesc(lat, lon)
//                    .stream().findFirst().orElse(new WeatherSnapshot());
            WeatherSnapshot snap = snapshotRepository
                    .findTopByLatitudeAndLongitudeOrderByRecordedAtDesc(lat, lon);

            if (snap == null) {
                snap = new WeatherSnapshot();
            }


            snap.setLatitude(lat);
            snap.setLongitude(lon);
            snap.setRiverDischarge(flood != null ? flood.getLatestDischarge() : null);
            snap.setRiverDischargeMax(flood != null ? flood.getMaxForecastDischarge() : null);
            snap.setRiskLevel(RiskLevel.valueOf(level.name()));
            snap.setRecordedAt(LocalDateTime.now());
            snapshotRepository.save(snap);
        } catch (Exception e) {
            log.warn("Failed to persist risk snapshot: {}", e.getMessage());
        }
    }
}
