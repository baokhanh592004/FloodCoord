package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.CreateRescueRequestDTO;

import java.util.UUID;

public interface RescueRequestService {

    /**
     * MEMBER tạo yêu cầu cứu hộ
     */
    UUID createRescueRequest(CreateRescueRequestDTO dto, com.team6.floodcoord.model.User currentUser);

}
