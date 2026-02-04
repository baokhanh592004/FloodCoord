package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.response.VehicleResponse;
import com.team6.floodcoord.model.Vehicle;

public class VehicleMapper {
    private VehicleMapper() {}

    public static VehicleResponse mapToResponse(Vehicle vehicle) {
        if (vehicle == null) return null;

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .name(vehicle.getName())
                .type(vehicle.getType())
                .licensePlate(vehicle.getLicensePlate())
                .capacity(vehicle.getCapacity())
                .status(vehicle.getStatus())
                .currentTeamId(vehicle.getCurrentTeam() != null ? vehicle.getCurrentTeam().getId() : null)
                .currentTeamName(vehicle.getCurrentTeam() != null ? vehicle.getCurrentTeam().getName() : null)
                .build();
    }
}
