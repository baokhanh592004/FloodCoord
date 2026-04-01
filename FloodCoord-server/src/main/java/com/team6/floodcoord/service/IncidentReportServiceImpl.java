package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AssignTeamRequest;
import com.team6.floodcoord.dto.request.CreateIncidentRequest;
import com.team6.floodcoord.dto.request.ResolveIncidentRequest;
import com.team6.floodcoord.dto.response.IncidentReportResponse;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.model.enums.*;
import com.team6.floodcoord.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentReportServiceImpl implements IncidentReportService {
    private final IncidentReportRepository incidentRepo;
    private final RescueRequestRepository requestRepo;
    private final RescueTeamRepository teamRepo;
    private final VehicleRepository vehicleRepo;
    private final SupplyRepository supplyRepo;
    private final RequestSupplyRepository requestSupplyRepo;
    private final CloudinaryService cloudinaryService;
    private final AttendanceRepository attendanceRepo;

    @Override
    @Transactional
    public void createIncidentReport(CreateIncidentRequest request, User leader) {
        // 1. Lấy rescue request
        RescueRequest rescueRequest = requestRepo.findById(request.getRescueRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhiệm vụ."));

        // Chỉ leader của team được gán mới được báo cáo
        if (rescueRequest.getAssignedTeam() == null ||
            !rescueRequest.getAssignedTeam().getLeader().getId().equals(leader.getId())) {
            throw new IllegalStateException("Chỉ Đội trưởng của nhiệm vụ này mới được phép báo cáo sự cố.");
        }

        // 2. Upload ảnh
        List<String> imageUrls = new ArrayList<>();
        if (request.getFiles() != null && request.getFiles().length > 0) {
            for (MultipartFile file : request.getFiles()) {
                try {
                    String url = cloudinaryService.uploadMedia(file);
                    imageUrls.add(url);
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi khi upload hình ảnh sự cố: " + e.getMessage());
                }
            }
        }

        // 3. Tạo báo cáo
        IncidentReport incidentReport = IncidentReport.builder()
                .rescueRequest(rescueRequest)
                .reportedBy(leader)
                .title(request.getTitle())
                .description(request.getDescription())
                .images(imageUrls)
                .status(IncidentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        incidentRepo.save(incidentReport);
        log.info("Leader {} đã báo cáo sự cố cho nhiệm vụ {}", leader.getEmail(), rescueRequest.getTrackingCode());
    }

    @Override
    @Transactional
    public void resolveIncident(Long incidentId, ResolveIncidentRequest resolveRequest, User coordinator) {
        IncidentReport incidentReport = incidentRepo.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo sự cố."));

        if (incidentReport.getStatus() == IncidentStatus.RESOLVED) {
            throw new IllegalStateException("Sự cố này đã được xử lý trước đó.");
        }

        RescueRequest rescueRequest = incidentReport.getRescueRequest();

        // Xác định đội cũ từ rescueRequest (ưu tiên) hoặc từ người báo cáo
        RescueTeam oldTeam = rescueRequest.getAssignedTeam();
        if (oldTeam == null && incidentReport.getReportedBy() != null) {
            oldTeam = incidentReport.getReportedBy().getRescueTeam();
        }

        Vehicle vehicle = rescueRequest.getAssignedVehicle();
        boolean requestedPostDeparture = Boolean.TRUE.equals(resolveRequest.getIsPostDeparture());
        boolean isStatusPostDeparture = rescueRequest.getStatus() != null
            && EnumSet.of(RequestStatus.MOVING, RequestStatus.ARRIVED, RequestStatus.RESCUING)
            .contains(rescueRequest.getStatus());

        List<Attendance> currentAttendances = attendanceRepo.findByRescueRequest_RequestId(rescueRequest.getRequestId());
        boolean hasPresentAttendance = currentAttendances.stream().anyMatch(a ->
            a.getStatus() == AttendanceStatus.PRESENT && a.getCheckTime() != null
        );

        boolean canUseAttendanceFallback = rescueRequest.getStatus() == RequestStatus.IN_PROGRESS && hasPresentAttendance;

        if (requestedPostDeparture && !(isStatusPostDeparture || canUseAttendanceFallback)) {
            throw new IllegalArgumentException(
                "Chỉ được chọn 'Đội đã xuất phát' khi nhiệm vụ đang MOVING/ARRIVED/RESCUING hoặc đã điểm danh xong (IN_PROGRESS)."
            );
        }

        boolean isPostDeparture = isStatusPostDeparture || (requestedPostDeparture && canUseAttendanceFallback);

        if (resolveRequest.getAction() == IncidentAction.ABORT) {
            // ============================================================
            // ABORT: CHỈ GIẢI PHÓNG TÀI NGUYÊN CŨ, KHÔNG GIAO ĐỘI MỚI
            // Giao đội mới sẽ thực hiện qua API riêng: POST /api/incidents/{id}/assign-team
            // ============================================================

            if (isPostDeparture) {
                // --- TRƯỜNG HỢP POST-DEPARTURE: Đội đã xuất phát trước khi sự cố ---
                // Đội cũ → OFF_DUTY, Xe cũ → MAINTENANCE, Vật tư KHÔNG hoàn lại

                // BƯỚC 1: Đội cũ → OFF_DUTY
                if (oldTeam != null) {
                    oldTeam.setStatus(TeamStatus.OFF_DUTY);
                    teamRepo.save(oldTeam);
                }

                // BƯỚC 2: Xe cũ → MAINTENANCE, tách khỏi đội
                if (vehicle != null) {
                    vehicle.setCurrentTeam(null);
                    vehicle.setStatus(VehicleStatus.MAINTENANCE);
                    vehicleRepo.save(vehicle);
                    rescueRequest.setAssignedVehicle(null);
                }

                // BƯỚC 3: Vật tư KHÔNG hoàn lại kho (đã mang đi)
                List<RequestSupply> oldSupplies = requestSupplyRepo.findByRequest(rescueRequest);
                requestSupplyRepo.deleteAll(oldSupplies);

                // Lưu ghi chú
                String note = String.format(
                        "[%s - %s]: POST-DEPARTURE - Hủy sự cố sau xuất phát. Đội %s → OFF_DUTY, Xe → MAINTENANCE. Lý do: %s",
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                        coordinator.getFullName(),
                        oldTeam != null ? oldTeam.getName() : "cũ",
                        resolveRequest.getCoordinatorResponse() != null ? resolveRequest.getCoordinatorResponse() : ""
                );
                rescueRequest.setCoordinatorNote(note);

            } else {
                // --- TRƯỜNG HỢP PRE-DEPARTURE: Đội CHƯA xuất phát ---
                // Đội cũ → AVAILABLE, Xe cũ → AVAILABLE, Vật tư hoàn lại kho

                // BƯỚC 1: Đội cũ → AVAILABLE
                if (oldTeam != null) {
                    oldTeam.setStatus(TeamStatus.AVAILABLE);
                    teamRepo.save(oldTeam);
                }

                // BƯỚC 2: Xe cũ → AVAILABLE, tách khỏi đội
                if (vehicle != null) {
                    vehicle.setCurrentTeam(null);
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepo.save(vehicle);
                    rescueRequest.setAssignedVehicle(null);
                }

                // BƯỚC 3: Vật tư hoàn lại kho
                List<RequestSupply> oldSupplies = requestSupplyRepo.findByRequest(rescueRequest);
                for (RequestSupply rs : oldSupplies) {
                    Supply supply = rs.getSupply();
                    supply.setQuantity(supply.getQuantity() + rs.getQuantity());
                    supplyRepo.save(supply);
                }
                requestSupplyRepo.deleteAll(oldSupplies);

                // Lưu ghi chú
                String note = String.format(
                        "[%s - %s]: PRE-DEPARTURE - Hủy sự cố trước xuất phát. Đội %s → AVAILABLE, Xe/Vật tư → Thu hồi. Lý do: %s",
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                        coordinator.getFullName(),
                        oldTeam != null ? oldTeam.getName() : "cũ",
                        resolveRequest.getCoordinatorResponse() != null ? resolveRequest.getCoordinatorResponse() : ""
                );
                rescueRequest.setCoordinatorNote(note);
            }

            // Đặt nhiệm vụ về VERIFIED (chờ điều phối giao đội mới)
            rescueRequest.setStatus(RequestStatus.VERIFIED);
            requestRepo.save(rescueRequest);

        } else if (resolveRequest.getAction() == IncidentAction.CONTINUE) {
            // Đội tiếp tục nhiệm vụ: đảm bảo đội ở trạng thái BUSY
            if (oldTeam != null && oldTeam.getStatus() != TeamStatus.BUSY) {
                oldTeam.setStatus(TeamStatus.BUSY);
                teamRepo.save(oldTeam);
            }
        }

        // Cập nhật record sự cố
        incidentReport.setStatus(IncidentStatus.RESOLVED);
        incidentReport.setCoordinatorResponse(resolveRequest.getCoordinatorResponse());
        incidentReport.setCoordinatorAction(resolveRequest.getAction());
        incidentReport.setIsPostDeparture(isPostDeparture);
        incidentReport.setResolvedAt(LocalDateTime.now());
        incidentRepo.save(incidentReport);

        log.info("Coordinator {} đã hủy sự cố ID {} (postDeparture={}). Chờ giao đội mới...",
                coordinator.getEmail(), incidentId, isPostDeparture);
    }

    @Override
    @Transactional
    public void assignTeamToIncident(Long incidentId, AssignTeamRequest request, User coordinator) {
        IncidentReport incidentReport = incidentRepo.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo sự cố."));

        RescueRequest rescueRequest = incidentReport.getRescueRequest();

        // Chỉ cho phép giao đội mới sau khi incident đã được RESOLVED với ABORT
        if (incidentReport.getStatus() != IncidentStatus.RESOLVED
                || incidentReport.getCoordinatorAction() != IncidentAction.ABORT) {
            throw new IllegalStateException("Sự cố chưa được hủy (ABORT) nên chưa thể giao đội mới.");
        }

        // Xác nhận nhiệm vụ ở trạng thái VERIFIED (chờ điều phối lại)
        if (rescueRequest.getStatus() != RequestStatus.VERIFIED) {
            throw new IllegalStateException(
                "Nhiệm vụ phải ở trạng thái chờ giao đội mới. Hiện tại: " + rescueRequest.getStatus()
            );
        }

        // Chọn đội mới
        if (request.getNewTeamId() == null) {
            throw new IllegalArgumentException("Bắt buộc phải chọn đội mới để giao nhiệm vụ.");
        }

        RescueTeam newTeam = teamRepo.findById(request.getNewTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đội mới để giao."));

        if (newTeam.getStatus() != TeamStatus.AVAILABLE) {
            throw new IllegalStateException(
                "Đội " + newTeam.getName() + " không sẵn sàng (trạng thái: " + newTeam.getStatus() + ")"
            );
        }

        // Giao nhiệm vụ cho đội mới
        rescueRequest.setAssignedTeam(newTeam);
        newTeam.setStatus(TeamStatus.BUSY);
        teamRepo.save(newTeam);

        // Xóa attendance cũ để đội mới điểm danh lại
        List<Attendance> oldAttendances = attendanceRepo.findByRescueRequest_RequestId(rescueRequest.getRequestId());
        attendanceRepo.deleteAll(oldAttendances);

        // Gán phương tiện (nếu có)
        if (request.getNewVehicleId() != null) {
            Vehicle newVehicle = vehicleRepo.findById(request.getNewVehicleId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phương tiện."));

            if (newVehicle.getStatus() != VehicleStatus.AVAILABLE) {
                throw new IllegalStateException(
                    "Phương tiện " + newVehicle.getName() + " không sẵn sàng (trạng thái: " + newVehicle.getStatus() + ")"
                );
            }

            newVehicle.setStatus(VehicleStatus.IN_USE);
            newVehicle.setCurrentTeam(newTeam);
            vehicleRepo.save(newVehicle);
            rescueRequest.setAssignedVehicle(newVehicle);
        }

        // Cấp phát vật tư (nếu có)
        if (request.getNewSupplies() != null && !request.getNewSupplies().isEmpty()) {
            for (com.team6.floodcoord.dto.request.AssignSupplyDTO sd : request.getNewSupplies()) {
                if (sd.getQuantity() == null || sd.getQuantity() <= 0) continue;

                Supply supply = supplyRepo.findById(sd.getSupplyId())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vật tư."));

                if (supply.getQuantity() < sd.getQuantity()) {
                    throw new IllegalStateException(
                        "Không đủ tồn kho cho vật tư: " + supply.getName()
                        + " (Còn: " + supply.getQuantity() + ", Cần: " + sd.getQuantity() + ")"
                    );
                }

                supply.setQuantity(supply.getQuantity() - sd.getQuantity());
                supplyRepo.save(supply);

                RequestSupply requestSupply = RequestSupply.builder()
                        .request(rescueRequest)
                        .supply(supply)
                        .quantity(sd.getQuantity())
                        .build();
                requestSupplyRepo.save(requestSupply);
            }
        }

        // Đặt nhiệm vụ ở trạng thái IN_PROGRESS (sẵn sàng cho đội mới bắt đầu)
        rescueRequest.setStatus(RequestStatus.IN_PROGRESS);

        // Cập nhật ghi chú
        String note = String.format(
                "[%s - %s]: Giao lại cho đội %s (sau khi hủy sự cố)",
                LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                coordinator.getFullName(),
                newTeam.getName()
        );
        rescueRequest.setCoordinatorNote(note);
        requestRepo.save(rescueRequest);

        log.info("Coordinator {} đã giao nhiệm vụ ID {} cho đội {} (sau hủy sự cố)",
                coordinator.getEmail(), rescueRequest.getRequestId(), newTeam.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReportResponse> getPendingIncidents() {
        return incidentRepo.findByStatusOrderByCreatedAtDesc(IncidentStatus.PENDING)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public Page<IncidentReportResponse> getAllIncidents(Pageable pageable) {
        return incidentRepo.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentReportResponse getLatestIncidentByRequest(UUID requestId, User requester) {
        // FIX: Trả về null thay vì throw exception khi không tìm thấy
        IncidentReport latestIncident = incidentRepo
                .findByRescueRequest_RequestIdOrderByCreatedAtDesc(requestId)
                .stream()
                .findFirst()
                .orElse(null);

        if (latestIncident == null) {
            return null;
        }

        String roleCode = requester.getRole() != null ? requester.getRole().getRoleCode() : "";
        boolean isCoordinatorSide = "COORDINATOR".equals(roleCode) || "ADMIN".equals(roleCode) || "MANAGER".equals(roleCode);

        if (!isCoordinatorSide) {
            // Cho phép xem nếu: (1) là người báo cáo, (2) hoặc là thành viên cùng đội với người báo cáo
            boolean isReporter = latestIncident.getReportedBy() != null
                    && latestIncident.getReportedBy().getId().equals(requester.getId());

            boolean isSameTeam = latestIncident.getReportedBy() != null
                    && latestIncident.getReportedBy().getRescueTeam() != null
                    && requester.getRescueTeam() != null
                    && latestIncident.getReportedBy().getRescueTeam().getId()
                            .equals(requester.getRescueTeam().getId());

            if (!isReporter && !isSameTeam) {
                throw new IllegalStateException("Bạn không có quyền xem báo cáo sự cố này.");
            }
        }

        return mapToResponse(latestIncident);
    }

    private IncidentReportResponse mapToResponse(IncidentReport incident) {
        // FIX: Lấy tên đội từ người báo cáo (reportedBy.rescueTeam),
        // KHÔNG từ rescueRequest.assignedTeam vì team có thể đã bị đổi sau khi reassign
        String teamName = "Chưa rõ";
        if (incident.getReportedBy() != null && incident.getReportedBy().getRescueTeam() != null) {
            teamName = incident.getReportedBy().getRescueTeam().getName();
        }

        // Thông tin chi tiết từ rescue request
        RescueRequest req = incident.getRescueRequest();
        String location = "Chưa rõ";
        if (req != null && req.getLocation() != null) {
            location = req.getLocation().getAddressText() != null ? req.getLocation().getAddressText() : "Chưa rõ";
        }
        boolean hasAttendanceRecord = req != null
            && !attendanceRepo.findByRescueRequest_RequestId(req.getRequestId()).isEmpty();

        return IncidentReportResponse.builder()
                .id(incident.getId())
                .rescueRequestId(req != null ? req.getRequestId() : null)
                .rescueRequestTitle(req != null ? req.getTitle() : null)
                .rescueRequestStatus(req != null ? req.getStatus() : null)
                .rescueRequestLocation(location)
                .rescueRequestPeopleCount(req != null ? req.getPeopleCount() : null)
                .rescueRequestEmergencyLevel(req != null ? req.getEmergencyLevel() : null)
                .rescueRequestDescription(req != null ? req.getDescription() : null)
                .hasAttendanceRecord(hasAttendanceRecord)
                .teamName(teamName)
                .reportedByName(incident.getReportedBy().getFullName())
                .reportedByPhone(incident.getReportedBy().getPhoneNumber())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .images(incident.getImages())
                .status(incident.getStatus())
                .coordinatorResponse(incident.getCoordinatorResponse())
                .coordinatorAction(incident.getCoordinatorAction())
                .isPostDeparture(incident.getIsPostDeparture())
                .createdAt(incident.getCreatedAt())
                .resolvedAt(incident.getResolvedAt())
                .build();
    }
}
