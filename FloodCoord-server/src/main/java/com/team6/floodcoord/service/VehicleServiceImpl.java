package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.VehicleRequest;
import com.team6.floodcoord.dto.response.VehicleResponse;
import com.team6.floodcoord.model.Vehicle;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.jpa.VehicleRepository;
import com.team6.floodcoord.utils.VehicleMapper;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
        Vehicle vehicle = vehicleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setStatus(VehicleStatus.UNAVAILABLE);

        vehicle.setCurrentTeam(null);

        vehicleRepo.save(vehicle);
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

    @Override
    public void importVehiclesFromExcel(MultipartFile file) {

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Đọc 5 cột
                Cell nameCell = row.getCell(0);
                Cell typeCell = row.getCell(1);
                Cell licenseCell = row.getCell(2);
                Cell capacityCell = row.getCell(3);
                Cell statusCell = row.getCell(4);

                // ==========================================
                // 1. VALIDATE: Name (Bắt buộc)
                // ==========================================
                if (nameCell == null || nameCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Tên xe' không được để trống.");
                }

                String name = nameCell.getStringCellValue().trim();

                if (name.isEmpty()) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Tên xe' không được để trống.");
                }

                if (vehicleRepo.existsByName(name)) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": Tên xe đã tồn tại.");
                }

                // ==========================================
                // 2. VALIDATE: Type (Bắt buộc)
                // ==========================================
                if (typeCell == null || typeCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Loại xe' không được để trống.");
                }

                String type = typeCell.getStringCellValue().trim();

                if (type.isEmpty()) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Loại xe' không được để trống.");
                }

                // ==========================================
                // 3. VALIDATE: License Plate (Bắt buộc)
                // ==========================================
                if (licenseCell == null || licenseCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Biển số xe' không được để trống.");
                }

                String licensePlate = licenseCell.getStringCellValue().trim();

                if (licensePlate.isEmpty()) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Biển số xe' không được để trống.");
                }

                if (vehicleRepo.existsByLicensePlate(licensePlate)) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": Biển số xe đã tồn tại.");
                }

                // ==========================================
                // 4. VALIDATE: Capacity
                // ==========================================
                if (capacityCell == null || capacityCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Sức chứa' không được để trống.");
                }

                int capacity = 0;

                if (capacityCell.getCellType() == CellType.NUMERIC) {
                    capacity = (int) capacityCell.getNumericCellValue();
                }
                else if (capacityCell.getCellType() == CellType.STRING) {
                    try {
                        capacity = Integer.parseInt(capacityCell.getStringCellValue().trim());
                    } catch (NumberFormatException ex) {
                        throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Sức chứa' phải là số.");
                    }
                }

                if (capacity <= 0) {
                    throw new IllegalArgumentException("Lỗi dòng " + (i + 1) + ": 'Sức chứa' phải lớn hơn 0.");
                }

                // ==========================================
                // 5. STATUS (Optional)
                // ==========================================
                VehicleStatus status = VehicleStatus.AVAILABLE;

                if (statusCell != null && statusCell.getCellType() != CellType.BLANK) {

                    String statusStr = statusCell.getStringCellValue().trim();

                    try {
                        status = VehicleStatus.valueOf(statusStr.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException(
                                "Lỗi dòng " + (i + 1) +
                                        ": Status không hợp lệ ('" + statusStr + "'). Chỉ chấp nhận: AVAILABLE, IN_USE, MAINTENANCE."
                        );
                    }
                }

                // ==========================================
                // SAVE DATABASE
                // ==========================================
                Vehicle vehicle = Vehicle.builder()
                        .name(name)
                        .type(type)
                        .licensePlate(licensePlate)
                        .capacity(capacity)
                        .status(status)
                        .build();

                vehicleRepo.save(vehicle);
            }

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi định dạng file Excel. Vui lòng kiểm tra lại file.");
        }
    }

    @Override
    public byte[] generateVehicleExcelTemplate() {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Import_Vehicles");

            Row headerRow = sheet.createRow(0);

            String[] headers = {
                    "Tên xe (*)",
                    "Loại xe (*)",
                    "Biển số xe (*)",
                    "Sức chứa (*)",
                    "Trạng thái (AVAILABLE, IN_USE, MAINTENANCE)"
            };

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.autoSizeColumn(i);
            }

            // Example row
            Row sampleRow = sheet.createRow(1);

            sampleRow.createCell(0).setCellValue("Rescue Truck 01");
            sampleRow.createCell(1).setCellValue("TRUCK");
            sampleRow.createCell(2).setCellValue("51A-12345");
            sampleRow.createCell(3).setCellValue(10);
            sampleRow.createCell(4).setCellValue("AVAILABLE");

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo file template: " + e.getMessage());
        }
    }
}
