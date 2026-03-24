package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AttendanceItemDTO;
import com.team6.floodcoord.dto.request.AttendanceRequestDTO;
import com.team6.floodcoord.dto.request.ReportRequestDTO;
import com.team6.floodcoord.dto.request.SupplyRemainDTO;
import com.team6.floodcoord.dto.response.AttendanceResponseDTO;
import com.team6.floodcoord.dto.response.*;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.model.enums.TeamStatus;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamLeaderServiceImpl implements TeamLeaderService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final RescueTeamRepository rescueTeamRepository;
    private final RescueRequestRepository rescueRequestRepository;
    private final RescueReportRepository rescueReportRepository;
    private final RequestSupplyRepository requestSupplyRepository;
    private final SupplyRepository supplyRepository;
    private final CloudinaryService cloudinaryService;
    private final ReportMediaRepository reportMediaRepository;
    private final com.team6.floodcoord.repository.VehicleRepository vehicleRepository;

    @Override
    @Transactional
    public void markAttendance(AttendanceRequestDTO request) {

        // 1️⃣ Lấy leader hiện tại
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        RescueTeam team = currentUser.getRescueTeam();
        if (team == null) {
            throw new RuntimeException("You are not assigned to any team");
        }
        RescueRequest rescueRequest = rescueRequestRepository
                .findById(request.getRequestId())
                .orElseThrow(() -> new RuntimeException("Rescue request not found"));

        if (!team.getLeader().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not the leader of this team");
        }

        // 2️⃣ Duyệt danh sách attendanceList
        for (AttendanceItemDTO item : request.getAttendanceList()) {

            User member = userRepository.findById(item.getMemberId())
                    .orElseThrow(() -> new RuntimeException("Member not found: " + item.getMemberId()));

            // Check member thuộc team
            if (member.getRescueTeam() == null ||
                    !member.getRescueTeam().getId().equals(team.getId())) {

                throw new RuntimeException("Member does not belong to your team");
            }

            // Không cho trùng
            if (attendanceRepository
                    .findByRescueRequest_RequestIdAndMember_Id(request.getRequestId(), member.getId())
                    .isPresent()) {

                throw new RuntimeException("Member already marked: " + member.getId());
            }

            Attendance attendance = Attendance.builder()
                    .rescueRequest(rescueRequest)
                    .member(member)
                    .status(item.getStatus())
                    .checkTime(LocalDateTime.now())
                    .build();

            attendanceRepository.save(attendance);
        }

        // 3️⃣ Auto đổi trạng thái team nếu đủ người
        long totalMembers = team.getMembers().size();

        long totalMarked = attendanceRepository
                .findByRescueRequest_RequestId(request.getRequestId())
                .size();

        if (totalMarked == totalMembers) {
            team.setStatus(TeamStatus.BUSY);
            rescueTeamRepository.save(team);
        }
    }

    @Override
    public List<AttendanceResponseDTO> getAttendanceByRescue(UUID requestId) {

        List<Attendance> attendances = attendanceRepository.findByRescueRequest_RequestId(requestId);

        return attendances.stream()
                .map(a -> AttendanceResponseDTO.builder()
                        .memberId(a.getMember().getId())
                        .memberName(a.getMember().getFullName())
                        .status(a.getStatus())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public void updateRescueStatus(UUID requestId, RequestStatus newStatus) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RescueTeam team = currentUser.getRescueTeam();

        if (team == null ||
                !team.getLeader().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only team leader can update status");
        }

        RescueRequest request = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rescue request not found"));

        if (request.getAssignedTeam() == null ||
                !request.getAssignedTeam().getId().equals(team.getId())) {
            throw new RuntimeException("This request is not assigned to your team");
        }

        validateTransition(request.getStatus(), newStatus);

        request.setStatus(newStatus);
        rescueRequestRepository.save(request);

        // Nếu completed thì trả team về available và trả xe
        if (newStatus == RequestStatus.COMPLETED) {
            team.setStatus(TeamStatus.AVAILABLE);
            rescueTeamRepository.save(team);

            // Trả xe về AVAILABLE
            if (request.getAssignedVehicle() != null) {
                Vehicle vehicle = request.getAssignedVehicle();
                if (vehicle.getStatus() == VehicleStatus.IN_USE) {
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicle.setCurrentTeam(null);
                    vehicleRepository.save(vehicle);
                }
            }
        }
    }

    @Override
    @Transactional
    public void submitReport(ReportRequestDTO dto) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        RescueTeam team = currentUser.getRescueTeam();
        if (team == null) {
            throw new RuntimeException("You are not assigned to any team");
        }

        if (!team.getLeader().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not the leader of this team");
        }

        RescueRequest request = rescueRequestRepository
                .findById(dto.getRequestId())
                .orElseThrow();

        if (request.getStatus() != RequestStatus.COMPLETED) {
            throw new RuntimeException("Only completed request can be reported");
        }

        if (!request.getAssignedTeam().getLeader().getId()
                .equals(currentUser.getId())) {
            throw new RuntimeException("Only team leader can report");
        }

        RescueReport report = RescueReport.builder()
                .request(request)
                .leader(currentUser)
                .rescuedPeople(dto.getRescuedPeople())
                .reportNote(dto.getNote())
                .reportedAt(LocalDateTime.now())
                .build();

        rescueReportRepository.save(report);

        // update status của rescue request
        request.setStatus(RequestStatus.REPORTED);
        rescueRequestRepository.save(request);

        // 🔥 Xử lý hoàn kho
        if (dto.getRemainSupplies() != null) {
            for (SupplyRemainDTO item : dto.getRemainSupplies()) {

                if (item.getRemainingQuantity() < 0) {
                    throw new RuntimeException("Remaining quantity cannot be negative");
                }
                RequestSupply rs = requestSupplyRepository
                        .findById(item.getRequestSupplyId())
                        .orElseThrow();

                int remain = item.getRemainingQuantity();

                if (remain > 0) {
                    Supply supply = rs.getSupply();
                    supply.setQuantity(supply.getQuantity() + remain);
                    supplyRepository.save(supply);

                    rs.setRemainingQuantity(remain);
                    requestSupplyRepository.save(rs);
                }
            }
        }
        // 7️⃣ Upload media lên Cloudinary
        if (dto.getMediaFiles() != null && dto.getMediaFiles().length > 0) {

            if (dto.getMediaFiles().length > 5) {
                throw new RuntimeException("Maximum 5 media files allowed");
            }

            for (MultipartFile file : dto.getMediaFiles()) {

                String url = null;
                try {
                    url = cloudinaryService.uploadMedia(file);
                } catch (IOException e) {
                    throw new RuntimeException("Upload media failed", e);
                }

                String mediaType = file.getContentType() != null &&
                        file.getContentType().startsWith("video")
                                ? "VIDEO"
                                : "IMAGE";

                ReportMedia media = ReportMedia.builder()
                        .report(report)
                        .mediaUrl(url)
                        .mediaType(mediaType)
                        .build();

                reportMediaRepository.save(media);
            }
        }

    }

    @Override
    public List<CompletedRequestDTO> getCompletedRequests(User leader) {

        Long teamId = leader.getRescueTeam().getId();

        List<RescueRequest> requests = rescueRequestRepository.findByAssignedTeam_IdAndStatusIn(
                teamId,
                   List.of(RequestStatus.COMPLETED, RequestStatus.REPORTED));

        return requests.stream()
                .map(this::mapToCompletedDTO)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    public List<RescueTeamMemberDTO> getMyTeamMembers() {

        // 1️⃣ Lấy email từ security context
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        // 2️⃣ Kiểm tra team
        RescueTeam team = currentUser.getRescueTeam();
        if (team == null) {
            throw new RuntimeException("You are not assigned to any team");
        }

        // 3️⃣ Kiểm tra leader
        if (!team.getLeader().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only team leader can view team members");
        }

        // 4️⃣ Lấy member của team
        List<User> members = userRepository.findByRescueTeam(team);

        Long leaderId = team.getLeader().getId();

        // 5️⃣ Convert sang DTO
        return members.stream()
                .map(user -> new RescueTeamMemberDTO(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getPhoneNumber(),
                        user.getRole().getRoleCode(),
                        user.getId().equals(leaderId)))
                .toList();
    }

    private void validateTransition(RequestStatus current, RequestStatus next) {

        switch (current) {

            case IN_PROGRESS -> {
                if (next != RequestStatus.MOVING)
                    throw new RuntimeException("Invalid transition");
            }

            case MOVING -> {
                if (next != RequestStatus.ARRIVED)
                    throw new RuntimeException("Invalid transition");
            }

            case ARRIVED -> {
                if (next != RequestStatus.RESCUING)
                    throw new RuntimeException("Invalid transition");
            }

            case RESCUING -> {
                if (next != RequestStatus.COMPLETED)
                    throw new RuntimeException("Invalid transition");
            }
            case COMPLETED -> {
                if (next != RequestStatus.REPORTED)
                    throw new RuntimeException("Invalid transition");
            }

            default -> throw new RuntimeException("Cannot update from this status");
        }
    }

    private CompletedRequestDTO mapToCompletedDTO(RescueRequest r) {

        // 📍 Location
        RequestLocationResponse location = null;
        if (r.getLocation() != null) {
            RequestLocation loc = r.getLocation();
            location = new RequestLocationResponse();
            location.setLatitude(loc.getLatitude());
            location.setLongitude(loc.getLongitude());
            location.setAddressText(loc.getAddressText());
            location.setFloodDepth(loc.getFloodDepth());
        }

        // 🖼 Media
        List<RequestMediaResponse> mediaList = null;
        if (r.getMediaList() != null && !r.getMediaList().isEmpty()) {
            mediaList = r.getMediaList().stream()
                    .map(m -> {
                        RequestMediaResponse media = new RequestMediaResponse();
                        media.setMediaId(m.getMediaId());
                        media.setMediaType(m.getMediaType());
                        media.setMediaUrl(m.getMediaUrl());
                        media.setUploadedAt(m.getUploadedAt());
                        return media;
                    })
                    .toList();
        }

        // 🚗 Vehicle
        VehicleResponse vehicleResponse = null;
        if (r.getAssignedVehicle() != null) {
            Vehicle v = r.getAssignedVehicle();
            vehicleResponse = VehicleResponse.builder()
                    .id(v.getId())
                    .name(v.getName())
                    .type(v.getType())
                    .licensePlate(v.getLicensePlate())
                    .capacity(v.getCapacity())
                    .status(v.getStatus())
                    .currentTeamId(
                            r.getAssignedTeam() != null
                                    ? r.getAssignedTeam().getId()
                                    : null)
                    .currentTeamName(
                            r.getAssignedTeam() != null
                                    ? r.getAssignedTeam().getName()
                                    : null)

                    .build();
        }

        // 📦 Supplies
        List<AssignedSupplyResponse> suppliesList = null;
        if (r.getSupplies() != null && !r.getSupplies().isEmpty()) {
            suppliesList = r.getSupplies().stream()
                    .map(rs -> new AssignedSupplyResponse(
                            rs.getId(),
                            rs.getSupply().getName(),
                            rs.getQuantity(),
                            rs.getSupply().getUnit()))
                    .toList();
        }

        return CompletedRequestDTO.builder()
                .requestId(r.getRequestId())
                .trackingCode(r.getTrackingCode())
                .title(r.getTitle())
                .emergencyLevel(r.getEmergencyLevel())
                .contactName(r.getContactName())
                .contactPhone(r.getContactPhone())
                .description(r.getDescription())
                .peopleCount(r.getPeopleCount())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .completedAt(r.getCompletedAt())
                .citizenFeedback(r.getCitizenFeedback())
                .citizenRating(r.getCitizenRating())
                .location(location)
                .media(mediaList)
                .vehicle(vehicleResponse)
                .supplies(suppliesList)
                .assignedTeamId(
                        r.getAssignedTeam() != null ? r.getAssignedTeam().getId() : null)
                .assignedTeamName(
                        r.getAssignedTeam() != null ? r.getAssignedTeam().getName() : null)
                .assignedTeamLeaderPhone(
                        r.getAssignedTeam() != null && r.getAssignedTeam().getLeader() != null
                                ? r.getAssignedTeam().getLeader().getPhoneNumber()
                                : null)
                .build();
    }
}