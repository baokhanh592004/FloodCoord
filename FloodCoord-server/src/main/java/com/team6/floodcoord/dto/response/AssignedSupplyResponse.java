package com.team6.floodcoord.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignedSupplyResponse {
    private Long supplyId;
    private String supplyName;
    private Integer quantity;
    private String unit;
}
