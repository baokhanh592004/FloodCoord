package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.Data;

@Data
public class UpdateRescueStatusRequest {
    private RequestStatus status;
}
