package com.team6.floodcoord.controller;


import com.team6.floodcoord.dto.request.UserRequest;
import com.team6.floodcoord.dto.request.UserUpdateRequest;
import com.team6.floodcoord.dto.response.RescueRequestSummaryResponse;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.service.RescueRequestService;
import com.team6.floodcoord.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final RescueRequestService rescueRequestService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(page = 0, size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public UserResponse createUser(@RequestBody UserRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request
    ) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Admin xem tất cả yêu cầu, có thể lọc theo trạng thái")
    public ResponseEntity<Page<RescueRequestSummaryResponse>> getAllRequests(
            @RequestParam(required = false) RequestStatus status,
            Pageable pageable) {

        // Nếu Admin không truyền ?status=..., nó sẽ lấy hết 100% yêu cầu
        return ResponseEntity.ok(rescueRequestService.getAllRequestsForAdmin(status, pageable));
    }

    @GetMapping("/template")
    @Operation(summary = "Tải file Excel mẫu để import người dùng")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] excelData = userService.generateExcelTemplate();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=User_Import_Template.xlsx")
                .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelData);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import danh sách người dùng từ file Excel")
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng chọn file Excel để upload");
        }
        try {
            userService.importUsersFromExcel(file);
            return ResponseEntity.ok("Import dữ liệu người dùng thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}