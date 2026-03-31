package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.UserRequest;
import com.team6.floodcoord.dto.request.UserUpdateRequest;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.Role;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.repository.jpa.RoleRepository;
import com.team6.floodcoord.repository.jpa.UserRepository;
import com.team6.floodcoord.utils.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());

        //validation
        if (userRepository.existsByEmail(request.getEmail())){
            log.warn("Attempt to create user with existing email: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())){
            log.warn("Attempt to create user with existing phone number: {}", request.getPhoneNumber());
            throw new IllegalArgumentException("Phone number already exists: " + request.getPhoneNumber());
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Password and confirm password do not match for email: {}", request.getEmail());
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        Role role = roleRepository.findByRoleCode(request.getRollCode())
                .orElseThrow(() -> {
                    log.error("Role not found: {}", request.getRollCode());
                    return new IllegalArgumentException("Role not found: " + request.getRollCode());
                });

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(true)
                .role(role)
                .build();

        userRepository.save(user);
        log.info("User created successfully with ID: {} and email: {}", user.getId(), user.getEmail());


        return  mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .build();

        if (user.getRole() != null) {
            response.setRoleName(user.getRole().getRoleName());
        }

        return response;
    }
    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }
    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }

    @Override
    public UserResponse getMyProfile(User currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return UserMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(User currentUser, com.team6.floodcoord.dto.request.ProfileUpdateRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra trùng lặp số điện thoại nếu người dùng đổi số mới
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new IllegalArgumentException("Số điện thoại này đã được sử dụng bởi người khác.");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Cập nhật họ tên
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        return UserMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public List<UserResponse> getAvailableRescueMembers() {
        return userRepository.findByRole_RoleCodeAndRescueTeamIsNull("RESCUE_TEAM")
                .stream()
                .map(UserMapper::toUserResponse)
                .toList();
    }

    @Override
    public byte[] generateExcelTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("User_Import_Template");

            // Tạo header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Họ và tên", "Email", "Số điện thoại", "Mật khẩu", "Mã vai trò (ADMIN, MANAGER, COORDINATOR, RESCUE_TEAM, CITIZEN)"};

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 6000); // Căn rộng cột
            }

            // Dữ liệu mẫu
            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("Nguyễn Văn Mẫu");
            dataRow.createCell(1).setCellValue("mau.nguyen@example.com");
            dataRow.createCell(2).setCellValue("0909123456");
            dataRow.createCell(3).setCellValue("Password123!");
            dataRow.createCell(4).setCellValue("COORDINATOR");

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating User Excel template: ", e);
            throw new RuntimeException("Lỗi khi tạo file Excel mẫu");
        }
    }

    @Override
    @Transactional
    public void importUsersFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            List<User> usersToSave = new ArrayList<>();

            // Bỏ qua dòng header (i = 1)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Đọc dữ liệu (ép kiểu an toàn tránh NullPointerException)
                String fullName = getCellValueAsString(row.getCell(0));
                String email = getCellValueAsString(row.getCell(1));
                String phone = getCellValueAsString(row.getCell(2));
                String password = getCellValueAsString(row.getCell(3));
                String roleCode = getCellValueAsString(row.getCell(4));

                // Bỏ qua dòng trống
                if (email.isEmpty() || password.isEmpty() || roleCode.isEmpty()) continue;

                // Validate trùng lặp email
                if (userRepository.existsByEmail(email)) {
                    log.warn("Bỏ qua user do email đã tồn tại: {}", email);
                    continue;
                }

                int currentRow = i + 1;

                // Lấy Role từ DB
                Role role = roleRepository.findByRoleCode(roleCode.toUpperCase())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vai trò: " + roleCode + " ở dòng " + currentRow));

                User newUser = User.builder()
                        .fullName(fullName)
                        .email(email)
                        .phoneNumber(phone)
                        .password(passwordEncoder.encode(password))
                        .status(true)
                        .role(role)
                        .build();

                usersToSave.add(newUser);
            }

            if (!usersToSave.isEmpty()) {
                userRepository.saveAll(usersToSave);
                log.info("Đã import thành công {} người dùng từ Excel", usersToSave.size());
            }

        } catch (Exception e) {
            log.error("Lỗi khi import file Excel: ", e);
            throw new RuntimeException("Lỗi khi đọc file Excel: " + e.getMessage());
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return String.valueOf((long) cell.getNumericCellValue());
            default: return "";
        }
    }


    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null)
            user.setFullName(request.getFullName());

        if (request.getPhoneNumber() != null)
            user.setPhoneNumber(request.getPhoneNumber());

        if (request.getStatus() != null)
            user.setStatus(request.getStatus());

        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        return mapToDTO(userRepository.save(user));
    }
    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserResponse mapToDTO(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .roleName(user.getRole().getRoleCode())
                .build();
    }
}
