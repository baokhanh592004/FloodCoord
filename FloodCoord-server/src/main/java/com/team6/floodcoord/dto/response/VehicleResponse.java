package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.VehicleStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleResponse {
    private Long id;
    private String name;
    private String type;
    private String licensePlate;
    private Integer capacity;
    private VehicleStatus status;

    // Thông tin đội (nếu có, hiển thị để Manager biết xe đang ở đâu)
    private Long currentTeamId;
    private String currentTeamName;
}
