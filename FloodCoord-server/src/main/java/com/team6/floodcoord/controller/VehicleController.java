package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.VehicleRequest;
import com.team6.floodcoord.dto.response.VehicleResponse;
import com.team6.floodcoord.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/vehicles") // Đổi path để rõ ràng là của manager
@RequiredArgsConstructor
@Tag(name = "Vehicle Management", description = "Quản lý phương tiện (Manager Only)")
@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
public class VehicleController {
    private final VehicleService vehicleService;

    @PostMapping
    @Operation(summary = "Thêm phương tiện mới")
    public ResponseEntity<VehicleResponse> createVehicle(@RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.createVehicle(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin/trạng thái phương tiện")
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable Long id, @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa phương tiện")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok("Deleted vehicle successfully");
    }

    @GetMapping
    @Operation(summary = "Xem danh sách tất cả phương tiện")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết phương tiện")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }
}
