package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.IncidentAction;
import lombok.Data;

import java.util.List;

@Data
public class ResolveIncidentRequest {
    private IncidentAction action;
    private String coordinatorResponse;

    /**
     * true = đội đã xuất phát khi sự cố xảy ra (post-departure).
     * Khi true + ABORT: đội cũ → OFF_DUTY, xe cũ → MAINTENANCE, vật tư KHÔNG hoàn lại kho.
     * Khi false + ABORT: đội cũ → AVAILABLE, xe cũ → AVAILABLE, vật tư hoàn lại kho.
     * Sau đó cần gọi API /api/incidents/{id}/assign-team để giao đội mới.
     */
    private Boolean isPostDeparture;
}

