package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.MonthlyStatDTO;
import com.team6.floodcoord.dto.response.CoordinatorDashboardResponse;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.repository.jpa.IncidentReportRepository;
import com.team6.floodcoord.repository.jpa.RequestSupplyRepository;
import com.team6.floodcoord.repository.jpa.RescueRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class CoordinatorAnalyticsService {
    private final RescueRequestRepository rescueRequestRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final RequestSupplyRepository requestSupplyRepository;

    public CoordinatorDashboardResponse getDashboardStats(LocalDate startDate, LocalDate endDate, LocalDate compareStartDate, LocalDate compareEndDate) {

        // Convert sang LocalDateTime
        LocalDateTime startTarget = startDate.atStartOfDay();
        LocalDateTime endTarget = endDate.atTime(23, 59, 59);
        LocalDateTime startCompare = compareStartDate.atStartOfDay();
        LocalDateTime endCompare = compareEndDate.atTime(23, 59, 59);

        // 1. Số ca giải quyết xong (COMPLETED)
        long currentResolved = rescueRequestRepository.countByStatusAndCompletedAtBetween(
                RequestStatus.COMPLETED, startTarget, endTarget);
        long lastResolved = rescueRequestRepository.countByStatusAndCompletedAtBetween(
                RequestStatus.COMPLETED, startCompare, endCompare);

        // 2. Số lượng báo cáo sự cố
        long currentIncidents = incidentReportRepository.countByCreatedAtBetween(startTarget, endTarget);
        long lastIncidents = incidentReportRepository.countByCreatedAtBetween(startCompare, endCompare);

        // 3. Tổng vật tư xuất kho
        long currentSupplies = requestSupplyRepository.sumSupplyQuantityByDateRange(startTarget, endTarget);
        long lastSupplies = requestSupplyRepository.sumSupplyQuantityByDateRange(startCompare, endCompare);

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
