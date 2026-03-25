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

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class TeamLeaderAnalyticsService {
    private final RescueRequestRepository rescueRequestRepository;
    private final UserRepository userRepository;

    public TeamLeaderDashboardResponse getDashboardStats(String email) {
        // 1. Lấy thông tin Team của người đang đăng nhập
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (user.getRescueTeam() == null) {
            throw new RuntimeException("Tài khoản này chưa được phân bổ vào Đội cứu hộ nào!");
        }
        Long teamId = user.getRescueTeam().getId();

        // 2. Tính toán thời gian
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        LocalDateTime startOfCurrentMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfCurrentMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        LocalDateTime startOfLastMonth = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        // 3. Query số liệu
        // - Số nhiệm vụ hoàn thành
        long currentMissions = rescueRequestRepository.countByAssignedTeam_IdAndStatusAndCompletedAtBetween(
                teamId, RequestStatus.COMPLETED, startOfCurrentMonth, endOfCurrentMonth);
        long lastMissions = rescueRequestRepository.countByAssignedTeam_IdAndStatusAndCompletedAtBetween(
                teamId, RequestStatus.COMPLETED, startOfLastMonth, endOfLastMonth);

        // - Số người đã cứu
        long currentRescued = rescueRequestRepository.sumRescuedPeopleByTeamAndDateRange(
                teamId, RequestStatus.COMPLETED, startOfCurrentMonth, endOfCurrentMonth);
        long lastRescued = rescueRequestRepository.sumRescuedPeopleByTeamAndDateRange(
                teamId, RequestStatus.COMPLETED, startOfLastMonth, endOfLastMonth);

        // - Điểm đánh giá
        double currentRating = rescueRequestRepository.getAverageRatingByTeamAndDateRange(
                teamId, RequestStatus.COMPLETED, startOfCurrentMonth, endOfCurrentMonth);
        double lastRating = rescueRequestRepository.getAverageRatingByTeamAndDateRange(
                teamId, RequestStatus.COMPLETED, startOfLastMonth, endOfLastMonth);

        // 4. Trả về kết quả
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
