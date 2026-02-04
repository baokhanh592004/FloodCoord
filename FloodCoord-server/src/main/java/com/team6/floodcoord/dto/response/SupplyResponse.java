package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.SupplyType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SupplyResponse {
    private Long id;
    private String name;
    private SupplyType type;
    private Integer quantity;
    private String unit;
    private String description;
    private LocalDateTime importedDate;
    private LocalDateTime exportedDate;
    private LocalDateTime expiryDate;
}
