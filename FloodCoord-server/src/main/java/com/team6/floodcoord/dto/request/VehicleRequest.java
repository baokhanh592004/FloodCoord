package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.VehicleStatus;
import lombok.Data;

@Data
public class VehicleRequest {
    private String name;
    private String type;
    private String licensePlate;
    private Integer capacity;

    // Manager có thể set thẳng trạng thái (VD: set về MAINTENANCE)
    private VehicleStatus status;
}
