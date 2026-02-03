package com.team6.floodcoord.controller;


import com.team6.floodcoord.dto.response.RescueRequestDetailResponse;
import com.team6.floodcoord.dto.response.RescueRequestSummaryResponse;
import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.service.RescueRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coordinator")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COORDINATOR')")
public class CoordinatorController {

    private final RescueRequestService rescueRequestService;

    // GET ALL rescue requests
    @GetMapping("/rescue-requests")
    public List<RescueRequestSummaryResponse> getAllRescueRequests() {
        return rescueRequestService.getAllRescueRequests();
    }
    @GetMapping("/rescue-requests/{id}")
    public RescueRequestDetailResponse getRescueRequestDetail(
            @PathVariable UUID id
    ) {
        return rescueRequestService.getRequestDetail(id);
    }
}
