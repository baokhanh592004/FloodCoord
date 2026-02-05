package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.SupplyType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SupplyRequest {
    private String name;
    private SupplyType type;
    private Integer quantity;
    private String unit;
    private String description;
    private LocalDateTime importedDate;
    private LocalDateTime exportedDate;
    private LocalDateTime expiryDate;
}
