package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.*;
import com.team6.floodcoord.dto.response.*;
import com.team6.floodcoord.model.RescueRequest;
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
    List<RescueRequestLeaderDTO> getMyAssignedRescueRequests();
    void claimGuestRequests(List<String> trackingCodes, User currentUser);
    List<RescueRequestSummaryResponse> getMyRescueRequests(User currentUser);
    void claimRequestManually(String trackingCode, String phoneNumber, User currentUser);
    List<CompletedRequestDTO> getReportedRequests();

    ReportDetailDTO getReportDetail(UUID requestId);
}
