package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.SupplyHealthDTO;
import com.team6.floodcoord.dto.TeamReadinessDTO;
import com.team6.floodcoord.dto.VehicleFleetDTO;
import com.team6.floodcoord.dto.response.ManagerDashboardResponse;
import com.team6.floodcoord.model.enums.TeamStatus;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.jpa.RescueTeamRepository;
import com.team6.floodcoord.repository.jpa.SupplyRepository;
import com.team6.floodcoord.repository.jpa.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ManagerAnalyticsService {
    private final RescueTeamRepository rescueTeamRepository;
    private final VehicleRepository vehicleRepository;
    private final SupplyRepository supplyRepository;

    private static final int LOW_STOCK_THRESHOLD = 20;

    public ManagerDashboardResponse getDashboardStats() {
        long totalTeams = rescueTeamRepository.count();
        long availableTeams = rescueTeamRepository.countByStatus(TeamStatus.AVAILABLE);
        long busyTeams = rescueTeamRepository.countByStatus(TeamStatus.BUSY);
        long offDutyTeams = rescueTeamRepository.countByStatus(TeamStatus.OFF_DUTY);

        long totalVehicles = vehicleRepository.count();
        long availableVehicles = vehicleRepository.countByStatus(VehicleStatus.AVAILABLE);
        long inUseVehicles = vehicleRepository.countByStatus(VehicleStatus.IN_USE);
        long maintenanceVehicles = vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE);

        long totalSupplies = supplyRepository.count();
        long outOfStock = supplyRepository.countByQuantity(0);
        long lowStock = supplyRepository.countByQuantityBetween(1, LOW_STOCK_THRESHOLD);

        return ManagerDashboardResponse.builder()
                .teamReadiness(TeamReadinessDTO.builder()
                        .totalTeams(totalTeams)
                        .availableCount(availableTeams)
                        .busyCount(busyTeams)
                        .offDutyCount(offDutyTeams)
                        .build())
                .vehicleFleet(VehicleFleetDTO.builder()
                        .totalVehicles(totalVehicles)
                        .availableCount(availableVehicles)
                        .inUseCount(inUseVehicles)
                        .maintenanceCount(maintenanceVehicles)
                        .build())
                .supplyHealth(SupplyHealthDTO.builder()
                        .totalSupplyTypes(totalSupplies)
                        .lowStockCount(lowStock)
                        .outOfStockCount(outOfStock)
                        .build())
                .build();
    }
}
