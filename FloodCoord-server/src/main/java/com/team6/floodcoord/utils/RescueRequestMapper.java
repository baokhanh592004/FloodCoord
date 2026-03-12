package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.response.RescueRequestSummaryResponse;
import com.team6.floodcoord.model.RescueRequest;
import org.springframework.stereotype.Component;

@Component
public class RescueRequestMapper {
    public RescueRequestSummaryResponse toSummaryResponse(RescueRequest request) {
        if (request == null) return null;

        RescueRequestSummaryResponse response = new RescueRequestSummaryResponse();

        // Gán đúng theo cấu trúc RescueRequestSummaryResponse của bạn
        response.setRequestId(request.getRequestId());
        response.setTrackingCode(request.getTrackingCode());
        response.setTitle(request.getTitle());
        response.setPeopleCount(request.getPeopleCount());
        response.setCreatedAt(request.getCreatedAt());

        // Chuyển đổi Enum sang String
        if (request.getStatus() != null) {
            response.setStatus(request.getStatus().name());
        }
        if (request.getEmergencyLevel() != null) {
            response.setEmergencyLevel(request.getEmergencyLevel());
        }

        // Thông tin liên hệ (Map từ fullName/phoneNumber của Entity)
        response.setContactName(request.getContactName());
        response.setContactPhone(request.getContactPhone());

        return response;
    }
}
