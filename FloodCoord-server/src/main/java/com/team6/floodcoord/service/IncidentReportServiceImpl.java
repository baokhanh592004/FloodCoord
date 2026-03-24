package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.CreateIncidentRequest;
import com.team6.floodcoord.dto.request.ResolveIncidentRequest;
import com.team6.floodcoord.dto.response.IncidentReportResponse;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.model.enums.*;
import com.team6.floodcoord.repository.jpa.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

        if (resolveRequest.getAction() == IncidentAction.ABORT) {

            // --- BƯỚC 1: Giải phóng đội cũ về AVAILABLE ---
            if (oldTeam != null) {
                oldTeam.setStatus(TeamStatus.AVAILABLE);
                teamRepo.save(oldTeam);
            }

            // --- BƯỚC 2: Thu hồi xe cũ về kho (luôn làm, dù có reassign hay không) ---
            if (vehicle != null) {
                vehicle.setCurrentTeam(null);
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicleRepo.save(vehicle);
                rescueRequest.setAssignedVehicle(null);
            }

            // --- BƯỚC 3: Thu hồi vật tư cũ về kho (luôn làm) ---
            List<RequestSupply> oldSupplies = requestSupplyRepo.findByRequest(rescueRequest);
            for (RequestSupply rs : oldSupplies) {
                Supply supply = rs.getSupply();
                supply.setQuantity(supply.getQuantity() + rs.getQuantity());
                supplyRepo.save(supply);
            }
            requestSupplyRepo.deleteAll(oldSupplies);

            if (resolveRequest.getNewTeamId() != null) {
                // ============================================================
                // TRƯỜNG HỢP CÓ REASSIGN: Giao nhiệm vụ cho đội mới ngay tại đây
                // ============================================================
                RescueTeam newTeam = teamRepo.findById(resolveRequest.getNewTeamId())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đội mới để reassign."));

                if (newTeam.getStatus() != TeamStatus.AVAILABLE) {
                    throw new IllegalStateException("Đội " + newTeam.getName() + " không sẵn sàng (trạng thái: " + newTeam.getStatus() + ")");
                }

                // Gán đội mới vào request, đặt trạng thái BUSY
                rescueRequest.setAssignedTeam(newTeam);
                newTeam.setStatus(TeamStatus.BUSY);
                teamRepo.save(newTeam);

                // Xóa attendance cũ để đội mới điểm danh lại từ đầu
                List<Attendance> oldAttendances = attendanceRepo.findByRescueRequest_RequestId(rescueRequest.getRequestId());
                attendanceRepo.deleteAll(oldAttendances);

                // Cấp xe mới (nếu coordinator chọn xe)
                if (resolveRequest.getNewVehicleId() != null) {
                    Vehicle newVehicle = vehicleRepo.findById(resolveRequest.getNewVehicleId())
                            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phương tiện ID " + resolveRequest.getNewVehicleId()));
                    if (newVehicle.getStatus() != VehicleStatus.AVAILABLE) {
                        throw new IllegalStateException("Phương tiện " + newVehicle.getName() + " không sẵn sàng (trạng thái: " + newVehicle.getStatus() + ")");
                    }
                    newVehicle.setStatus(VehicleStatus.IN_USE);
                    newVehicle.setCurrentTeam(newTeam);
                    vehicleRepo.save(newVehicle);
                    rescueRequest.setAssignedVehicle(newVehicle);
                }

                // Cấp phát vật tư mới (nếu coordinator chọn vật tư)
                if (resolveRequest.getNewSupplies() != null && !resolveRequest.getNewSupplies().isEmpty()) {
                    for (com.team6.floodcoord.dto.request.AssignSupplyDTO sd : resolveRequest.getNewSupplies()) {
                        if (sd.getQuantity() == null || sd.getQuantity() <= 0) continue;
                        Supply supply = supplyRepo.findById(sd.getSupplyId())
                                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy vật tư ID " + sd.getSupplyId()));
                        if (supply.getQuantity() < sd.getQuantity()) {
                            throw new IllegalStateException("Không đủ tồn kho cho vật tư: " + supply.getName()
                                    + " (Còn: " + supply.getQuantity() + ", Cần: " + sd.getQuantity() + ")");
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

                // Đặt request về IN_PROGRESS (đội mới nhận ngay)
                rescueRequest.setStatus(RequestStatus.IN_PROGRESS);

                // Ghi chú reassign
                String oldNote = rescueRequest.getCoordinatorNote() != null ? rescueRequest.getCoordinatorNote() : "";
                String reassignNote = String.format(
                        "[%s - %s]: Sự cố được xử lý. Nhiệm vụ giao lại cho đội %s. Lý do: %s",
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                        coordinator.getFullName(),
                        newTeam.getName(),
                        resolveRequest.getCoordinatorResponse() != null ? resolveRequest.getCoordinatorResponse() : "Không có ghi chú"
                );
                rescueRequest.setCoordinatorNote(oldNote.isEmpty() ? reassignNote : oldNote + "\n" + reassignNote);

            } else {
                // ============================================================
                // TRƯỜNG HỢP KHÔNG REASSIGN: Trả request về hàng chờ
                // (Xe và vật tư đã được thu hồi ở bước 2 & 3 phía trên)
                // ============================================================

                // Xe cũ: nếu coordinator muốn đưa vào bảo trì thay vì AVAILABLE
                if (vehicle != null) {
                    String vehicleStatusStr = resolveRequest.getVehicleStatus();
                    if ("MAINTENANCE".equals(vehicleStatusStr)) {
                        vehicle.setStatus(VehicleStatus.MAINTENANCE);
                        vehicleRepo.save(vehicle);
                    }
                    // Nếu AVAILABLE (hoặc null) đã xử lý ở bước 2 rồi
                }

                // Trả request về VERIFIED (chờ điều phối viên gán đội mới)
                rescueRequest.setStatus(RequestStatus.VERIFIED);
                rescueRequest.setAssignedTeam(null);

                String oldNote = rescueRequest.getCoordinatorNote() != null ? rescueRequest.getCoordinatorNote() : "";
                String abortNote = String.format(
                        "[%s - %s]: Sự cố được báo cáo. Nhiệm vụ đang chờ điều phối đội mới. Lý do: %s",
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                        coordinator.getFullName(),
                        resolveRequest.getCoordinatorResponse() != null ? resolveRequest.getCoordinatorResponse() : "Không có ghi chú"
                );
                rescueRequest.setCoordinatorNote(oldNote.isEmpty() ? abortNote : oldNote + "\n" + abortNote);
            }

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
        incidentReport.setResolvedAt(LocalDateTime.now());
        incidentRepo.save(incidentReport);

        log.info("Coordinator {} đã giải quyết sự cố ID {} với hành động {}",
                coordinator.getEmail(), incidentId, resolveRequest.getAction());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReportResponse> getPendingIncidents() {
        return incidentRepo.findByStatusOrderByCreatedAtDesc(IncidentStatus.PENDING)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentReportResponse> getAllIncidents() {
        return incidentRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponse).toList();
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

        return IncidentReportResponse.builder()
                .id(incident.getId())
                .rescueRequestId(incident.getRescueRequest() != null ? incident.getRescueRequest().getRequestId() : null)
                .rescueRequestTitle(incident.getRescueRequest() != null ? incident.getRescueRequest().getTitle() : null)
                .teamName(teamName)
                .reportedByName(incident.getReportedBy().getFullName())
                .reportedByPhone(incident.getReportedBy().getPhoneNumber())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .images(incident.getImages())
                .status(incident.getStatus())
                .coordinatorResponse(incident.getCoordinatorResponse())
                .coordinatorAction(incident.getCoordinatorAction())
                .createdAt(incident.getCreatedAt())
                .resolvedAt(incident.getResolvedAt())
                .build();
    }
}
