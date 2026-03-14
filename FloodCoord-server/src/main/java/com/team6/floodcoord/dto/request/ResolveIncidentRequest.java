package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.IncidentAction;
import lombok.Data;

@Data
public class ResolveIncidentRequest {
    private IncidentAction action;
    private String coordinatorResponse;
    private String vehicleStatus;
}
