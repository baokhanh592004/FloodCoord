package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.VehicleRequest;
import com.team6.floodcoord.dto.response.VehicleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface VehicleService {
    VehicleResponse createVehicle(VehicleRequest request);
    VehicleResponse updateVehicle(Long id, VehicleRequest request);
    void deleteVehicle(Long id);
    Page<VehicleResponse> getAllVehicles(Pageable pageable);
    VehicleResponse getVehicleById(Long id);
    public void importVehiclesFromExcel(MultipartFile file);
    public byte[] generateVehicleExcelTemplate();
}
