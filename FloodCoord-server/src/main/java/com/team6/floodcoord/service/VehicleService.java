package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.VehicleRequest;
import com.team6.floodcoord.dto.response.VehicleResponse;

import java.util.List;

public interface VehicleService {
    VehicleResponse createVehicle(VehicleRequest request);
    VehicleResponse updateVehicle(Long id, VehicleRequest request);
    void deleteVehicle(Long id);
    List<VehicleResponse> getAllVehicles();
    VehicleResponse getVehicleById(Long id);
}
