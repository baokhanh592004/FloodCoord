package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.SupplyRequest;
import com.team6.floodcoord.dto.response.SupplyResponse;
import com.team6.floodcoord.model.Supply;
import com.team6.floodcoord.model.enums.SupplyType;
import com.team6.floodcoord.repository.jpa.SupplyRepository;
import com.team6.floodcoord.utils.SupplyMapper;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
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

    @Override
    public byte[] generateExcelTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import_VatTu");

            // Tạo Header Row (Thêm 3 cột mới)
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Tên vật tư (*)",
                    "Loại vật tư (FOOD_WATER, MEDICAL, EQUIPMENT, OTHER)",
                    "Số lượng (*)",
                    "Đơn vị tính (*)",
                    "Mô tả / Ghi chú",
                    "Ngày nhập kho (dd/MM/yyyy)",
                    "Hạn sử dụng (dd/MM/yyyy)"
            };

            // Style cho Header (in đậm)
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

            // Dòng data mẫu
            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("Mì Hảo Hảo");
            dataRow.createCell(1).setCellValue("FOOD_WATER");
            dataRow.createCell(2).setCellValue(100);
            dataRow.createCell(3).setCellValue("Thùng");
            dataRow.createCell(4).setCellValue("Ưu tiên phân phát nhanh");
            dataRow.createCell(5).setCellValue(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            dataRow.createCell(6).setCellValue(LocalDateTime.now().plusMonths(6).format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo file Excel mẫu: " + e.getMessage());
        }
    }

    private LocalDateTime parseExcelDate(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;

        // Trường hợp 1: Người dùng format cột đó là dạng Date trong Excel
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue();
        }
        // Trường hợp 2: Người dùng gõ text chữ bình thường (vd: "25/12/2026")
        else if (cell.getCellType() == CellType.STRING) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                return LocalDate.parse(cell.getStringCellValue().trim(), formatter).atStartOfDay();
            } catch (Exception e) {
                return null; // Bỏ qua nếu nhập sai format
            }
        }
        return null;
    }

    @Override
    public void importSuppliesFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Đọc 7 cột
                Cell nameCell = row.getCell(0);
                Cell typeCell = row.getCell(1);
                Cell quantityCell = row.getCell(2);
                Cell unitCell = row.getCell(3);
                Cell descCell = row.getCell(4);
                Cell importDateCell = row.getCell(5);
                Cell expiryDateCell = row.getCell(6);

                // ==========================================
                // 1. VALIDATE: Tên vật tư (Bắt buộc)
                // ==========================================
                if (nameCell == null || nameCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Tên vật tư' không được để trống.");
                }
                String name = nameCell.getStringCellValue().trim();
                if (name.isEmpty()) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Tên vật tư' không được để trống.");
                }

                // ==========================================
                // 2. VALIDATE: Loại vật tư (Bắt buộc & Đúng chuẩn Enum)
                // ==========================================
                if (typeCell == null || typeCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Loại vật tư' không được để trống.");
                }
                String typeStr = typeCell.getStringCellValue().trim();
                SupplyType supplyType;
                try {
                    supplyType = SupplyType.valueOf(typeStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": Loại vật tư không hợp lệ ('" + typeStr + "'). Chỉ chấp nhận: FOOD_WATER, MEDICAL, EQUIPMENT, OTHER.");
                }

                // ==========================================
                // 3. VALIDATE: Số lượng (Bắt buộc & Phải > 0)
                // ==========================================
                if (quantityCell == null || quantityCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Số lượng' không được để trống.");
                }
                int quantity = 0;
                if (quantityCell.getCellType() == CellType.NUMERIC) {
                    quantity = (int) quantityCell.getNumericCellValue();
                } else if (quantityCell.getCellType() == CellType.STRING) {
                    try {
                        quantity = Integer.parseInt(quantityCell.getStringCellValue().trim());
                    } catch (NumberFormatException ex) {
                        throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Số lượng' phải là định dạng số.");
                    }
                }
                if (quantity <= 0) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Số lượng' phải lớn hơn 0.");
                }

                // ==========================================
                // 4. VALIDATE: Đơn vị tính (Bắt buộc)
                // ==========================================
                if (unitCell == null || unitCell.getCellType() == CellType.BLANK) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Đơn vị tính' không được để trống.");
                }
                String unit = unitCell.getStringCellValue().trim();
                if (unit.isEmpty()) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (i + 1) + ": 'Đơn vị tính' không được để trống.");
                }

                // ==========================================
                // Các trường không bắt buộc (Optional)
                // ==========================================
                String description = (descCell != null && descCell.getCellType() == CellType.STRING) ? descCell.getStringCellValue().trim() : "";

                LocalDateTime parsedImportDate = parseExcelDate(importDateCell);
                LocalDateTime importedDate = parsedImportDate != null ? parsedImportDate : LocalDateTime.now();

                LocalDateTime expiryDate = parseExcelDate(expiryDateCell);

                // ==========================================
                // XỬ LÝ LƯU DATABASE (Cộng dồn hoặc Tạo mới)
                // ==========================================
                Optional<Supply> existingSupply = supplyRepo.findByNameIgnoreCase(name);

                if (existingSupply.isPresent()) {
                    Supply supply = existingSupply.get();
                    supply.setQuantity(supply.getQuantity() + quantity);

                    if (!description.isEmpty()) supply.setDescription(description);
                    if (parsedImportDate != null) supply.setImportedDate(parsedImportDate);
                    if (expiryDate != null) supply.setExpiryDate(expiryDate);

                    supplyRepo.save(supply);
                } else {
                    Supply newSupply = Supply.builder()
                            .name(name)
                            .type(supplyType)
                            .quantity(quantity)
                            .unit(unit)
                            .description(description)
                            .importedDate(importedDate)
                            .expiryDate(expiryDate)
                            .build();
                    supplyRepo.save(newSupply);
                }
            }
        } catch (IllegalArgumentException e) {
            // Đẩy lỗi Validate cụ thể (dòng số mấy) ra ngoài Controller
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi định dạng file Excel. Vui lòng kiểm tra lại file của bạn.");
        }
}
}
