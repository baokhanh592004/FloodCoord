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

    @GetMapping("/template")
    @Operation(summary = "Tải file Excel mẫu để import vật tư")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] excelData = supplyService.generateExcelTemplate();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Supply_Import_Template.xlsx")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelData);
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import danh sách vật tư từ file Excel")
    public ResponseEntity<String> importExcel(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng chọn file Excel để upload");
        }

        try {
            supplyService.importSuppliesFromExcel(file);
            return ResponseEntity.ok("Import dữ liệu vật tư thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
