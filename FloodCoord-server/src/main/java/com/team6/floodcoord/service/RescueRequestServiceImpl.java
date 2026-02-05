package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.*;
import com.team6.floodcoord.dto.response.*;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.model.enums.TeamStatus;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RescueRequestServiceImpl implements RescueRequestService {

    private final RescueRequestRepository requestRepo;
    private final RequestLocationRepository locationRepo;
    private final RequestMediaRepository mediaRepo;
    private final RescueTeamRepository teamRepo;
    private final VehicleRepository vehicleRepo;
    private final SupplyRepository supplyRepo;
    private final RequestSupplyRepository requestSupplyRepo;

    @Override
    public CreateRequestResponse createRescueRequest(CreateRescueRequestDTO dto, User currentUser) {

        RescueRequest request = new RescueRequest();

        // 1. Xử lý User (Nếu có đăng nhập thì link, không thì null)
        if (currentUser != null) {
            request.setCitizen(currentUser);
        }

        // 2. Xử lý Thông tin liên hệ (Contact Info)
        // Ưu tiên lấy từ Form gửi lên. Nếu Form để trống mà User đã đăng nhập -> Lấy từ User Profile
        String name = dto.getContactName();
        String phone = dto.getContactPhone();

        if ((name == null || name.trim().isEmpty()) && currentUser != null) {
            name = currentUser.getFullName();
        }
        if ((phone == null || phone.trim().isEmpty()) && currentUser != null) {
            phone = currentUser.getPhoneNumber();
        }

        // Validate: Bắt buộc phải có SĐT để liên lạc
        if (name == null || phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Thông tin liên hệ (Tên và SĐT) là bắt buộc để xác minh.");
        }

        request.setContactName(name);
        request.setContactPhone(phone);

        // 3. Sinh Tracking Code
        // (Lưu ý: Trong thực tế nên có vòng lặp while check trùng code trong DB để an toàn tuyệt đối)
        request.setTrackingCode(generateTrackingCode());

        // 4. Map các trường thông tin khác
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setEmergencyLevel(dto.getEmergencyLevel());
        request.setPeopleCount(dto.getPeopleCount());

        // Trạng thái ban đầu luôn là PENDING
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        // Lưu Request trước để có ID
        request = requestRepo.save(request);

        // 5. Lưu Location (Vị trí)
        if (dto.getLocation() != null) {
            LocationDTO loc = dto.getLocation();
            RequestLocation location = new RequestLocation();
            location.setRequest(request); // Link với request vừa tạo
            location.setLatitude(loc.getLatitude());
            location.setLongitude(loc.getLongitude());
            location.setAddressText(loc.getAddressText());
            location.setFloodDepth(loc.getFloodDepth());
            locationRepo.save(location);
        }

        // 6. Lưu Media (Hình ảnh/Video)
        if (dto.getMediaUrls() != null && !dto.getMediaUrls().isEmpty()) {
            for (MediaDTO m : dto.getMediaUrls()) {
                RequestMedia media = new RequestMedia();
                media.setRequest(request);
                media.setMediaType(m.getMediaType());
                media.setMediaUrl(m.getMediaUrl());
                media.setUploadedAt(LocalDateTime.now());
                mediaRepo.save(media);
            }
        }

        // 7. Trả về Response chứa Tracking Code
        return CreateRequestResponse.builder()
                .requestId(request.getRequestId())
                .trackingCode(request.getTrackingCode())
                .build();
    }

    @Override
    public void assignTask(UUID requestId, AssignTaskRequest dto, User coordinator) {
        // 1. Lấy Request
        RescueRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Chỉ cho phép điều phối nếu chưa hoàn thành hoặc hủy
        if (request.getStatus() == RequestStatus.COMPLETED || request.getStatus() == RequestStatus.CANCELLED) {
            throw new IllegalStateException("Cannot assign task to a closed request");
        }

        // 2. Gán Đội Cứu Hộ
        if (dto.getRescueTeamId() != null) {
            RescueTeam team = teamRepo.findById(dto.getRescueTeamId())
                    .orElseThrow(() -> new RuntimeException("Rescue Team not found"));

            //CHECK BẬN/RẢNH
            if (team.getStatus() == TeamStatus.BUSY) {
                throw new IllegalStateException("Đội cứu hộ '" + team.getName() + "' đang bận thực hiện nhiệm vụ khác.");
            }
            if (team.getStatus() == TeamStatus.OFF_DUTY) {
                throw new IllegalStateException("Đội cứu hộ '" + team.getName() + "' đang trong thời gian nghỉ (OFF_DUTY).");
            }

            // Set trạng thái thành BẬN
            team.setStatus(TeamStatus.BUSY);
            teamRepo.save(team);

            request.setAssignedTeam(team);
        } else {
            throw new IllegalArgumentException("Rescue Team is required");
        }

        // 3. Gán & Khóa Phương Tiện (Nếu có)
        if (dto.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepo.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
                throw new IllegalStateException("Vehicle " + vehicle.getName() + " is not available (Current: " + vehicle.getStatus() + ")");
            }

            // Cập nhật trạng thái xe -> IN_USE
            vehicle.setStatus(VehicleStatus.IN_USE);
            vehicle.setCurrentTeam(request.getAssignedTeam()); // Gán xe cho team này
            vehicleRepo.save(vehicle);

            request.setAssignedVehicle(vehicle);
        }

        // 4. Cấp phát Vật tư (Trừ kho)
        if (dto.getSupplies() != null && !dto.getSupplies().isEmpty()) {
            for (AssignSupplyDTO supplyDTO : dto.getSupplies()) {
                Supply supply = supplyRepo.findById(supplyDTO.getSupplyId())
                        .orElseThrow(() -> new RuntimeException("Supply ID " + supplyDTO.getSupplyId() + " not found"));

                // Check tồn kho
                if (supply.getQuantity() < supplyDTO.getQuantity()) {
                    throw new IllegalStateException("Not enough quantity for supply: " + supply.getName()
                            + " (Available: " + supply.getQuantity() + ")");
                }

                // Trừ kho
                supply.setQuantity(supply.getQuantity() - supplyDTO.getQuantity());
                supply.setExportedDate(LocalDateTime.now()); // Cập nhật ngày xuất gần nhất
                supplyRepo.save(supply);

                // Lưu lịch sử cấp phát
                RequestSupply requestSupply = RequestSupply.builder()
                        .request(request)
                        .supply(supply)
                        .quantity(supplyDTO.getQuantity())
                        .build();
                requestSupplyRepo.save(requestSupply);
            }
        }

        // 5. Cập nhật trạng thái Request
        request.setStatus(RequestStatus.IN_PROGRESS);
        request.setVerifiedBy(coordinator);

        if (dto.getEmergencyLevel() != null) {
            request.setEmergencyLevel(dto.getEmergencyLevel());
        }

        requestRepo.save(request);
    }

    @Override
    public void verifyRequest(UUID requestId, VerifyRequestDTO dto, User coordinator) {
        // 1. Tìm Request
        RescueRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rescue Request not found"));

        // 2. Validate Status (Chỉ được xác minh khi đang PENDING)
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request can only be verified when status is PENDING. Current: " + request.getStatus());
        }

        // 3. Cập nhật thông tin xác minh
        request.setStatus(RequestStatus.VERIFIED); // Chuyển sang đã xác minh
        request.setVerifiedBy(coordinator);        // Lưu người duyệt

        if (dto.getEmergencyLevel() != null) {
            request.setEmergencyLevel(dto.getEmergencyLevel());
        }

        // Cập nhật ghi chú (Nếu có gửi lên)
        if (dto.getNote() != null && !dto.getNote().isEmpty()) {
            request.setCoordinatorNote(dto.getNote());
        }

        requestRepo.save(request);
    }

    @Override
    public void updateProgress(UUID requestId, UpdateProgressDTO dto, User currentUser) {
        // 1. Tìm Request
        RescueRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 2. Validate Quyền hạn: Chỉ thành viên của đội được phân công mới được update
        if (request.getAssignedTeam() == null) {
            throw new IllegalStateException("Request has not been assigned to any team yet.");
        }

        // 3. CHECK QUYỀN: Chỉ Leader của đội đó mới được update
        RescueTeam assignedTeam = request.getAssignedTeam();
        boolean isLeader = false;
        if (currentUser != null && assignedTeam.getLeader() != null) {
            isLeader = assignedTeam.getLeader().getId().equals(currentUser.getId());
        }

        // Cho phép thêm Admin/Manager update hộ
        boolean isAdmin = false;
        if (currentUser != null && currentUser.getRole() != null) {
            isAdmin = currentUser.getRole().getRoleCode().equals("ADMIN") ||
                    currentUser.getRole().getRoleCode().equals("MANAGER");
        }

        if (!isLeader && !isAdmin) {
            throw new IllegalStateException("Only the Team Leader can update mission progress.");
        }

        // 4. VALIDATE TRẠNG THÁI (Logic nhảy cóc)
        validateStatusTransition(request.getStatus(), dto.getStatus());

        // 5. Cập nhật Trạng thái
        request.setStatus(dto.getStatus());

        // Nếu Đội báo cáo đã xong (COMPLETED) -> Giải phóng xe và đội ngay lập tức
        if (dto.getStatus() == RequestStatus.COMPLETED) {
            releaseResources(request);
            request.setCompletedAt(LocalDateTime.now());
        }

        // 6. Cập nhật Note (Append - Cộng dồn)
        if (dto.getNote() != null && !dto.getNote().isEmpty()) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM"));
            String updaterName = currentUser != null ? currentUser.getFullName() : "Unknown";

            // Tạo dòng log mới
            String newLog = String.format("[%s - %s]: %s", timestamp, updaterName, dto.getNote());

            // Lấy note cũ
            String oldNote = request.getCoordinatorNote() != null ? request.getCoordinatorNote() : "";

            // Nối note cũ + xuống dòng + note mới
            request.setCoordinatorNote(oldNote.isEmpty() ? newLog : oldNote + "\n" + newLog);
        }

        // 7. Lưu Media (Bằng chứng hình ảnh)
        if (dto.getMedia() != null) {
            for (MediaDTO m : dto.getMedia()) {
                RequestMedia media = new RequestMedia();
                media.setRequest(request);
                media.setMediaType(m.getMediaType()); // VD: "IMAGE"
                media.setMediaUrl(m.getMediaUrl());   // VD: "https://..."
                media.setUploadedAt(LocalDateTime.now());
                mediaRepo.save(media);
            }
        }

        requestRepo.save(request);
    }

    @Override
    public void confirmCompletion(UUID requestId, CitizenConfirmRequest dto, User currentUser) {
        RescueRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 1. VALIDATE TRACKING CODE (Bắt buộc để bảo mật, thay cho login)
        if (dto.getTrackingCode() == null || !dto.getTrackingCode().equalsIgnoreCase(request.getTrackingCode())) {
            throw new IllegalArgumentException("Mã theo dõi (Tracking Code) không chính xác.");
        }

        // 2. XỬ LÝ TRẠNG THÁI
        // Trường hợp A: Team Leader chưa bấm COMPLETED -> Hệ thống chốt trạng thái & trả xe
        if (request.getStatus() != RequestStatus.COMPLETED) {
            // Chỉ cho phép hoàn thành khi đang được cứu hoặc đã đến (tránh spam khi đang PENDING)
            if (request.getStatus() == RequestStatus.PENDING || request.getStatus() == RequestStatus.VERIFIED) {
                throw new IllegalStateException("Không thể xác nhận hoàn thành khi yêu cầu chưa được xử lý/phân công.");
            }

            request.setStatus(RequestStatus.COMPLETED);
            request.setCompletedAt(LocalDateTime.now());

            // Gọi hàm giải phóng xe & đội
            releaseResources(request);
        }

        // Trường hợp B: Status đã là COMPLETED (do Team Leader bấm trước đó)
        // -> Vẫn cho phép chạy tiếp xuống dưới để lưu Feedback & Rating

        // 3. LƯU ĐÁNH GIÁ (FEEDBACK & RATING)
        if (dto.getFeedback() != null) {
            request.setCitizenFeedback(dto.getFeedback());
        }
        if (dto.getRating() != null) {
            request.setCitizenRating(dto.getRating());
        }

        requestRepo.save(request);
    }

    @Override
    public RescueRequestResponse trackRequest(String trackingCode) {
        RescueRequest request = requestRepo.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu cứu hộ với mã: " + trackingCode));

        // Map Entity sang Response DTO
        return RescueRequestResponse.builder()
                .id(request.getRequestId())
                .trackingCode(request.getTrackingCode())
                .status(request.getStatus())
                .title(request.getTitle())
                .description(request.getDescription())
                .coordinatorNote(request.getCoordinatorNote()) // Hiển thị tiến độ
                .createdAt(request.getCreatedAt())
                .completedAt(request.getCompletedAt())

                // Map thông tin đội (nếu có)
                .assignedTeamName(request.getAssignedTeam() != null ? request.getAssignedTeam().getName() : "Chưa phân công")
                .assignedTeamPhone(
                        (request.getAssignedTeam() != null && request.getAssignedTeam().getLeader() != null)
                                ? request.getAssignedTeam().getLeader().getPhoneNumber()
                                : null
                )
                .build();
    }

    @Override
    public List<RescueRequestSummaryResponse> getAllRescueRequests() {
        return requestRepo.findAll().stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    public RescueRequestDetailResponse getRequestDetail(UUID requestId) {
        RescueRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rescue request not found"));

        RescueRequestDetailResponse dto = new RescueRequestDetailResponse();
        dto.setRequestId(request.getRequestId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setEmergencyLevel(request.getEmergencyLevel());
        dto.setStatus(request.getStatus().toString());
        dto.setPeopleCount(request.getPeopleCount());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setCitizenName(
                request.getCitizen() != null ? request.getCitizen().getFullName() : null
        );

        // 📍 Location
        if (request.getLocation() != null) {
            RequestLocationResponse loc = new RequestLocationResponse();
            loc.setLatitude(request.getLocation().getLatitude());
            loc.setLongitude(request.getLocation().getLongitude());
            loc.setAddressText(request.getLocation().getAddressText());
            loc.setFloodDepth(request.getLocation().getFloodDepth());
            dto.setLocation(loc);
        }

        // 🖼️ Media
        if (request.getMediaList() != null) {
            List<RequestMediaResponse> mediaList = request.getMediaList().stream().map(m -> {
                RequestMediaResponse media = new RequestMediaResponse();
                media.setMediaId(m.getMediaId());
                media.setMediaType(m.getMediaType());
                media.setMediaUrl(m.getMediaUrl());
                media.setUploadedAt(m.getUploadedAt());
                return media;
            }).toList();

            dto.setMedia(mediaList);
        }

        return dto;
    }

    // Hàm kiểm tra logic chuyển trạng thái
    private void validateStatusTransition(RequestStatus currentStatus, RequestStatus newStatus) {
        // Không được chuyển về trạng thái cũ hoặc nhảy cóc quá xa (tùy độ chặt chẽ bạn muốn)

        // 1. Nếu đang IN_PROGRESS -> chỉ được sang MOVING
        if (currentStatus == RequestStatus.IN_PROGRESS && newStatus != RequestStatus.MOVING) {
            throw new IllegalArgumentException("Nhiệm vụ mới nhận, vui lòng cập nhật trạng thái 'Đang di chuyển' (MOVING) trước.");
        }

        // 2. Nếu đang MOVING -> chỉ được sang ARRIVED
        if (currentStatus == RequestStatus.MOVING && newStatus != RequestStatus.ARRIVED) {
            throw new IllegalArgumentException("Vui lòng xác nhận 'Đã đến nơi' (ARRIVED) trước khi cứu hộ.");
        }

        // 3. Nếu đang ARRIVED -> chỉ được sang RESCUING
        if (currentStatus == RequestStatus.ARRIVED && newStatus != RequestStatus.RESCUING) {
            throw new IllegalArgumentException("Vui lòng cập nhật trạng thái 'Đang cứu hộ' (RESCUING).");
        }

        // 4. Logic chung: Không được quay lại trạng thái PENDING hoặc VERIFIED
        if (newStatus == RequestStatus.PENDING || newStatus == RequestStatus.VERIFIED) {
            throw new IllegalArgumentException("Không thể quay lại trạng thái chờ.");
        }
    }

    private String generateTrackingCode() {
        // Có thể dùng thư viện hoặc random đơn giản
        // VD: Lấy 6 ký tự đầu của UUID hoặc Random Alphanumeric
        return "SOS" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private void releaseResources(RescueRequest request) {
        // 1. Trả xe về kho
        if (request.getAssignedVehicle() != null) {
            Vehicle vehicle = request.getAssignedVehicle();
            if (vehicle.getStatus() == VehicleStatus.IN_USE) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicle.setCurrentTeam(null);
                vehicleRepo.save(vehicle);
            }
        }

        // 2. Trả Đội về trạng thái RẢNH
        if (request.getAssignedTeam() != null) {
            RescueTeam team = request.getAssignedTeam();
            // Chỉ trả về AVAILABLE nếu đội đang là BUSY
            if (team.getStatus() == TeamStatus.BUSY) {
                team.setStatus(TeamStatus.AVAILABLE);
                teamRepo.save(team);
            }
        }
    }
    private RescueRequestSummaryResponse mapToSummary(RescueRequest request) {
        RescueRequestSummaryResponse dto = new RescueRequestSummaryResponse();
        dto.setRequestId(request.getRequestId());
        dto.setTitle(request.getTitle());
        dto.setEmergencyLevel(request.getEmergencyLevel());
        dto.setStatus(request.getStatus().toString());
        dto.setPeopleCount(request.getPeopleCount());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setContactName(request.getContactName());
        dto.setContactPhone(request.getContactPhone());
        return dto;
    }
}
