package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.SupplyRequest;
import com.team6.floodcoord.dto.response.SupplyResponse;
import com.team6.floodcoord.model.Supply;
import com.team6.floodcoord.repository.SupplyRepository;
import com.team6.floodcoord.utils.SupplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplyServiceImpl implements  SupplyService{
    private final SupplyRepository supplyRepo;

    @Override
    public SupplyResponse createSupply(SupplyRequest request) {
        Supply supply = Supply.builder()
                .name(request.getName())
                .type(request.getType())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 0) // Mặc định là 0
                .unit(request.getUnit())
                .description(request.getDescription())
                .importedDate(request.getImportedDate() != null ? request.getImportedDate() : LocalDateTime.now())
                .exportedDate(request.getExportedDate())
                .expiryDate(request.getExpiryDate())
                .build();

        return SupplyMapper.mapToResponse(supplyRepo.save(supply));
    }

    @Override
    public SupplyResponse updateSupply(Long id, SupplyRequest request) {
        Supply supply = supplyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supply not found"));

        if (request.getName() != null && !request.getName().equals(supply.getName())) {
            supply.setName(request.getName());
        }

        if (request.getType() != null) supply.setType(request.getType());
        if (request.getUnit() != null) supply.setUnit(request.getUnit());
        if (request.getDescription() != null) supply.setDescription(request.getDescription());

        // Cập nhật số lượng (Nhập kho/Xuất kho thủ công)
        if (request.getQuantity() != null) {
            if (request.getQuantity() < 0) {
                throw new IllegalArgumentException("Quantity cannot be negative");
            }
            supply.setQuantity(request.getQuantity());
        }

        if (request.getImportedDate() != null) supply.setImportedDate(request.getImportedDate());
        if (request.getExportedDate() != null) supply.setExportedDate(request.getExportedDate());
        if (request.getExpiryDate() != null) supply.setExpiryDate(request.getExpiryDate());

        return SupplyMapper.mapToResponse(supplyRepo.save(supply));
    }

    @Override
    public void deleteSupply(Long id) {
        if (!supplyRepo.existsById(id)) {
            throw new RuntimeException("Supply not found");
        }
        supplyRepo.deleteById(id);
    }

    @Override
    public List<SupplyResponse> getAllSupplies() {
        return supplyRepo.findAll().stream()
                .map(SupplyMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SupplyResponse getSupplyById(Long id) {
        Supply supply = supplyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supply not found"));
        return SupplyMapper.mapToResponse(supply);
    }
}
