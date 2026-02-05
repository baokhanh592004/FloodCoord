package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.response.SupplyResponse;
import com.team6.floodcoord.model.Supply;

public class SupplyMapper {
    private SupplyMapper() {}

    public static SupplyResponse mapToResponse(Supply supply) {
        if (supply == null) return null;

        return SupplyResponse.builder()
                .id(supply.getId())
                .name(supply.getName())
                .type(supply.getType())
                .quantity(supply.getQuantity())
                .unit(supply.getUnit())
                .description(supply.getDescription())
                .importedDate(supply.getImportedDate())
                .exportedDate(supply.getExportedDate())
                .expiryDate(supply.getExpiryDate())
                .build();
    }
}
