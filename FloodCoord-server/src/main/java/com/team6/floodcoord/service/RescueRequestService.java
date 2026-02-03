package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.CreateRescueRequestDTO;
import com.team6.floodcoord.dto.response.RescueRequestDetailResponse;
import com.team6.floodcoord.dto.response.RescueRequestSummaryResponse;

import java.util.List;
import java.util.UUID;

public interface RescueRequestService {

    /**
     * MEMBER tạo yêu cầu cứu hộ
     */
    UUID createRescueRequest(CreateRescueRequestDTO dto, com.team6.floodcoord.model.User currentUser);
    List<RescueRequestSummaryResponse> getAllRescueRequests();
    RescueRequestDetailResponse getRequestDetail(UUID requestId);

}
