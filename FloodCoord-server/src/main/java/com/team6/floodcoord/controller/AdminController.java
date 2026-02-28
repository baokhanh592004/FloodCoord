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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final RescueRequestService rescueRequestService;

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
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
}
