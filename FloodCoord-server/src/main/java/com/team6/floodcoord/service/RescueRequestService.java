package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.*;
import com.team6.floodcoord.dto.response.CreateRequestResponse;
import com.team6.floodcoord.dto.response.RescueRequestDetailResponse;
import com.team6.floodcoord.dto.response.RescueRequestResponse;
import com.team6.floodcoord.dto.response.RescueRequestSummaryResponse;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RescueRequestService {
    CreateRequestResponse createRescueRequest(CreateRescueRequestDTO dto, com.team6.floodcoord.model.User currentUser);
    void assignTask(UUID requestId, AssignTaskRequest dto, User coordinator);
    void verifyRequest(UUID requestId, VerifyRequestDTO dto, User coordinator);
    void updateProgress(UUID requestId, UpdateProgressDTO dto, User currentUser);
    void confirmCompletion(UUID requestId, CitizenConfirmRequest dto, User currentUser);
    RescueRequestResponse trackRequest(String trackingCode);
    List<RescueRequestSummaryResponse> getAllRescueRequests();
    RescueRequestDetailResponse getRequestDetail(UUID requestId);
    Page<RescueRequestSummaryResponse> getAllRequestsForAdmin(RequestStatus status, Pageable pageable);
}
