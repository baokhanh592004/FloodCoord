package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.VehicleRequest;
import com.team6.floodcoord.dto.response.VehicleResponse;
import com.team6.floodcoord.model.Vehicle;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.VehicleRepository;
import com.team6.floodcoord.utils.VehicleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleServiceImpl implements  VehicleService{
    private final VehicleRepository vehicleRepo;

    @Override
    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepo.existsByName(request.getName())) {
            throw new IllegalArgumentException("Vehicle name already exists");
        }

        if (vehicleRepo.existsByLicensePlate(request.getLicensePlate())) {
            throw new IllegalArgumentException("Vehicle license plate already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .name(request.getName())
                .type(request.getType())
                .licensePlate(request.getLicensePlate())
                .capacity(request.getCapacity())
                // Mặc định là AVAILABLE nếu không truyền
                .status(request.getStatus() != null ? request.getStatus() : VehicleStatus.AVAILABLE)
                .build();
        return VehicleMapper.mapToResponse(vehicleRepo.save(vehicle));
    }

    @Override
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (request.getName() != null && !request.getName().equals(vehicle.getName())) {
            // Kiểm tra trùng tên trước khi set
            if (vehicleRepo.existsByName(request.getName())) {
                throw new IllegalArgumentException("Tên phương tiện đã tồn tại: " + request.getName());
            }
            vehicle.setName(request.getName());
        }
        if (request.getType() != null) vehicle.setType(request.getType());
        if (request.getCapacity() != null) vehicle.setCapacity(request.getCapacity());
        if (request.getLicensePlate() != null) vehicle.setLicensePlate(request.getLicensePlate());

        // 2. Xử lý logic thay đổi trạng thái
        if (request.getStatus() != null && request.getStatus() != vehicle.getStatus()) {

            // CHẶN THAY ĐỔI KHI ĐANG SỬ DỤNG
            if (vehicle.getStatus() == VehicleStatus.IN_USE) {
                throw new IllegalStateException(
                        "Không thể thay đổi trạng thái khi xe đang được sử dụng (IN_USE). " +
                                "Vui lòng yêu cầu Coordinator thu hồi xe từ đội cứu hộ '" +
                                (vehicle.getCurrentTeam() != null ? vehicle.getCurrentTeam().getName() : "Unknown") +
                                "' trước."
                );
            }
            vehicle.setStatus(request.getStatus());

            // Nếu chuyển sang trạng thái không sẵn sàng (Bảo trì/Hỏng), đảm bảo ngắt kết nối với Team (để an toàn dữ liệu)
            if (request.getStatus() == VehicleStatus.MAINTENANCE || request.getStatus() == VehicleStatus.UNAVAILABLE) {
                vehicle.setCurrentTeam(null);
            }
        }
        return VehicleMapper.mapToResponse(vehicleRepo.save(vehicle));
    }

    @Override
    public void deleteVehicle(Long id) {
        if (!vehicleRepo.existsById(id)) {
            throw new RuntimeException("Vehicle not found");
        }
        vehicleRepo.deleteById(id);
    }

    @Override
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepo.findAll().stream()
                .map(VehicleMapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return VehicleMapper.mapToResponse(vehicle);
    }
}
