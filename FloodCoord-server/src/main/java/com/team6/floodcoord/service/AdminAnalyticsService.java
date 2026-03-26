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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {
    private final UserRepository userRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final VehicleRepository vehicleRepository;

    public AdminDashboardResponse getDashboardStats(LocalDate startDate, LocalDate endDate, LocalDate compareStartDate, LocalDate compareEndDate) {

        // Convert LocalDate (Ngày) sang LocalDateTime (Ngày + Giờ) để so sánh chính xác trong DB
        LocalDateTime startTarget = startDate.atStartOfDay(); // 00:00:00
        LocalDateTime endTarget = endDate.atTime(23, 59, 59); // 23:59:59

        LocalDateTime startCompare = compareStartDate.atStartOfDay();
        LocalDateTime endCompare = compareEndDate.atTime(23, 59, 59);

        // 1. Thống kê User (Truyền startTarget, endTarget thay vì hardcode)
        long currentMonthUsers = userRepository.countByCreatedAtBetween(startTarget, endTarget);
        long lastMonthUsers = userRepository.countByCreatedAtBetween(startCompare, endCompare);

        // 2. Thống kê Yêu cầu cứu hộ
        long currentMonthRequests = rescueRequestRepository.countByCreatedAtBetween(startTarget, endTarget);
        long lastMonthRequests = rescueRequestRepository.countByCreatedAtBetween(startCompare, endCompare);

        // 3. Thống kê Phương tiện (Cái này là Real-time tại thời điểm xem, nên không cần tham số ngày tháng)
        long available = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long inUse = vehicleRepository.countByStatus(VehicleStatus.IN_USE);
        long maintenance = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE);

        return AdminDashboardResponse.builder()
                .newUsers(buildMonthlyStat(currentMonthUsers, lastMonthUsers))
                .rescueRequests(buildMonthlyStat(currentMonthRequests, lastMonthRequests))
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
