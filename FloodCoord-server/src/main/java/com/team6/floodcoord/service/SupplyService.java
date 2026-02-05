package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.SupplyRequest;
import com.team6.floodcoord.dto.response.SupplyResponse;

import java.util.List;

public interface SupplyService {
    SupplyResponse createSupply(SupplyRequest request);
    SupplyResponse updateSupply(Long id, SupplyRequest request);
    void deleteSupply(Long id);
    List<SupplyResponse> getAllSupplies();
    SupplyResponse getSupplyById(Long id);
}
