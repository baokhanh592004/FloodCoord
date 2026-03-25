package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import com.team6.floodcoord.dto.VehicleStatDTO;
import com.team6.floodcoord.dto.response.AdminDashboardResponse;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.jpa.RescueRequestRepository;
import com.team6.floodcoord.repository.jpa.UserRepository;
import com.team6.floodcoord.repository.jpa.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {
    private final UserRepository userRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final VehicleRepository vehicleRepository;

    public AdminDashboardResponse getDashboardStats() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        LocalDateTime startOfCurrentMoth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfCurrentMoth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        LocalDateTime startOfLastMoth = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfLastMoth = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        long currentMonthUsers = userRepository.countByCreatedAtBetween(startOfCurrentMoth, endOfCurrentMoth);
        long lastMonthUsers = userRepository.countByCreatedAtBetween(startOfLastMoth, endOfLastMoth);

        long currentMothRequests = rescueRequestRepository.countByCreatedAtBetween(startOfCurrentMoth, endOfCurrentMoth);
        long lastMothRequests = rescueRequestRepository.countByCreatedAtBetween(startOfLastMoth, endOfLastMoth);

        long available = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long inUse = vehicleRepository.countByStatus(VehicleStatus.IN_USE);
        long maintenance = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE);

        return AdminDashboardResponse.builder()
                .newUsers(buildMonthlyStat(currentMonthUsers, lastMonthUsers))
                .rescueRequests(buildMonthlyStat(lastMothRequests, currentMothRequests))
                .vehicles(VehicleStatDTO.builder()
                        .availableCount(available)
                        .inUseCount(inUse)
                        .maintenanceCount(maintenance)
                        .totalCount(available + inUse + maintenance)
                        .build())
                .build();
    }

    private MonthlyStatDTO buildMonthlyStat(long current, long last) {
        double growthRate = 0.0;
        if (last > 0){
            growthRate = ((double) (current - last) / last) * 100.0;
        } else if (current > 0){
            growthRate = 100.0;
        }

        return MonthlyStatDTO.builder()
                .currentMonthValue(current)
                .lastMonthValue(last)
                .growthRate(Math.round(growthRate * 100.0) / 100.0)
                .build();
    }
}
