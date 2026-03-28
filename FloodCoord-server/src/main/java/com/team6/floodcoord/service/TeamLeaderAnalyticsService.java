package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import com.team6.floodcoord.dto.response.MonthlyDoubleStatDTO;
import com.team6.floodcoord.dto.response.TeamLeaderDashboardResponse;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.repository.jpa.RescueRequestRepository;
import com.team6.floodcoord.repository.jpa.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamLeaderAnalyticsService {
    private final RescueRequestRepository rescueRequestRepository;
    private final UserRepository userRepository;

    public TeamLeaderDashboardResponse getDashboardStats(String email, LocalDate startDate, LocalDate endDate, LocalDate compareStartDate, LocalDate compareEndDate) {

        // 1. Tìm Team ID của người đang login
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (user.getRescueTeam() == null) {
            throw new RuntimeException("Tài khoản này chưa được phân bổ vào Đội cứu hộ nào!");
        }
        Long teamId = user.getRescueTeam().getId();

        // 2. Convert sang LocalDateTime
        LocalDateTime startTarget = startDate.atStartOfDay();
        LocalDateTime endTarget = endDate.atTime(23, 59, 59);
        LocalDateTime startCompare = compareStartDate.atStartOfDay();
        LocalDateTime endCompare = compareEndDate.atTime(23, 59, 59);

        // 3. Query DB
        List<RequestStatus> validStatuses = Arrays.asList(RequestStatus.COMPLETED, RequestStatus.REPORTED);

        long currentMissions = rescueRequestRepository.countByAssignedTeam_IdAndStatusInAndCompletedAtBetween(
                teamId, validStatuses, startTarget, endTarget);
        long lastMissions = rescueRequestRepository.countByAssignedTeam_IdAndStatusInAndCompletedAtBetween(
                teamId, validStatuses, startCompare, endCompare);

        long currentRescued = rescueRequestRepository.sumRescuedPeopleByTeamAndDateRange(
                teamId, validStatuses, startTarget, endTarget);
        long lastRescued = rescueRequestRepository.sumRescuedPeopleByTeamAndDateRange(
                teamId, validStatuses, startCompare, endCompare);

        double currentRating = rescueRequestRepository.getAverageRatingByTeamAndDateRange(
                teamId, validStatuses, startTarget, endTarget);
        double lastRating = rescueRequestRepository.getAverageRatingByTeamAndDateRange(
                teamId, validStatuses, startCompare, endCompare);

        return TeamLeaderDashboardResponse.builder()
                .completedMissions(buildMonthlyStat(currentMissions, lastMissions))
                .rescuedPeople(buildMonthlyStat(currentRescued, lastRescued))
                .averageRating(buildMonthlyDoubleStat(currentRating, lastRating))
                .build();
    }

    // Helper cho kiểu Long (Số nguyên)
    private MonthlyStatDTO buildMonthlyStat(long current, long last) {
        double growthRate = 0.0;
        if (last > 0) {
            growthRate = ((double) (current - last) / last) * 100.0;
        } else if (current > 0) {
            growthRate = 100.0;
        }
        return MonthlyStatDTO.builder()
                .currentMonthValue(current)
                .lastMonthValue(last)
                .growthRate(Math.round(growthRate * 100.0) / 100.0)
                .build();
    }

    // Helper cho kiểu Double (Số thập phân - dùng cho Rating)
    private MonthlyDoubleStatDTO buildMonthlyDoubleStat(double current, double last) {
        double growthRate = 0.0;
        if (last > 0.0) {
            growthRate = ((current - last) / last) * 100.0;
        } else if (current > 0.0) {
            growthRate = 100.0;
        }
        return MonthlyDoubleStatDTO.builder()
                .currentMonthValue(Math.round(current * 10.0) / 10.0) // Làm tròn 1 chữ số thập phân (VD: 4.5)
                .lastMonthValue(Math.round(last * 10.0) / 10.0)
                .growthRate(Math.round(growthRate * 100.0) / 100.0) // Làm tròn 2 chữ số thập phân
                .build();
    }
}
