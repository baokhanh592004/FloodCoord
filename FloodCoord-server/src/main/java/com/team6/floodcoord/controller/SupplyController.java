package com.team6.floodcoord.controller;

import com.team6.floodcoord.dto.request.SupplyRequest;
import com.team6.floodcoord.dto.response.SupplyResponse;
import com.team6.floodcoord.service.SupplyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/supplies")
@RequiredArgsConstructor
@Tag(name = "Supply Management", description = "Quản lý vật tư cứu trợ (Manager Only)")
@PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
public class SupplyController {
    private final SupplyService supplyService;

    @PostMapping
    @Operation(summary = "Thêm loại vật tư mới")
    public ResponseEntity<SupplyResponse> createSupply(@RequestBody SupplyRequest request) {
        return ResponseEntity.ok(supplyService.createSupply(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin/số lượng vật tư")
    public ResponseEntity<SupplyResponse> updateSupply(@PathVariable Long id, @RequestBody SupplyRequest request) {
        return ResponseEntity.ok(supplyService.updateSupply(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa vật tư")
    public ResponseEntity<String> deleteSupply(@PathVariable Long id) {
        supplyService.deleteSupply(id);
        return ResponseEntity.ok("Deleted supply successfully");
    }

    @GetMapping
    @Operation(summary = "Xem danh sách tồn kho")
    public ResponseEntity<List<SupplyResponse>> getAllSupplies() {
        return ResponseEntity.ok(supplyService.getAllSupplies());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết vật tư")
    public ResponseEntity<SupplyResponse> getSupplyById(@PathVariable Long id) {
        return ResponseEntity.ok(supplyService.getSupplyById(id));
    }
}
