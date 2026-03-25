package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import com.team6.floodcoord.dto.response.CoordinatorDashboardResponse;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.repository.jpa.IncidentReportRepository;
import com.team6.floodcoord.repository.jpa.RequestSupplyRepository;
import com.team6.floodcoord.repository.jpa.RescueRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class CoordinatorAnalyticsService {
    private final RescueRequestRepository rescueRequestRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final RequestSupplyRepository requestSupplyRepository;

    public CoordinatorDashboardResponse getDashboardStats() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        LocalDateTime startOfCurrentMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfCurrentMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        LocalDateTime startOfLastMonth = lastMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfLastMonth = lastMonth.atEndOfMonth().atTime(23, 59, 59);

        long currentResolved = rescueRequestRepository.countByStatusAndCompletedAtBetween(
                RequestStatus.COMPLETED, startOfCurrentMonth, endOfCurrentMonth);
        long lastResolved = rescueRequestRepository.countByStatusAndCompletedAtBetween(
                RequestStatus.COMPLETED, startOfLastMonth, endOfLastMonth);

        long currentIncidents = incidentReportRepository.countByCreatedAtBetween(startOfCurrentMonth, endOfCurrentMonth);
        long lastIncidents = incidentReportRepository.countByCreatedAtBetween(startOfLastMonth, endOfLastMonth);

        long currentSupplies = requestSupplyRepository.sumSupplyQuantityByDateRange(startOfCurrentMonth, endOfCurrentMonth);
        long lastSupplies = requestSupplyRepository.sumSupplyQuantityByDateRange(startOfLastMonth, endOfLastMonth);

        return CoordinatorDashboardResponse.builder()
                .resolvedRequests(buildMonthlyStat(currentResolved, lastResolved))
                .incidentReports(buildMonthlyStat(currentIncidents, lastIncidents))
                .supplyUsage(buildMonthlyStat(currentSupplies, lastSupplies))
                .build();
    }

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
}
