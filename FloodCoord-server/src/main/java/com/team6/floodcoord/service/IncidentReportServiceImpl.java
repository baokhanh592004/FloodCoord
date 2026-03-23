package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.CreateIncidentRequest;
import com.team6.floodcoord.dto.request.ResolveIncidentRequest;
import com.team6.floodcoord.dto.response.IncidentReportResponse;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.model.enums.*;
import com.team6.floodcoord.repository.*;
import jdk.jfr.Enabled;
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
public class IncidentReportServiceImpl implements IncidentReportService{
    private final IncidentReportRepository incidentRepo;
    private final RescueRequestRepository requestRepo;
    private final RescueTeamRepository teamRepo;
    private final VehicleRepository vehicleRepo;
    private final SupplyRepository supplyRepo;
    private final RequestSupplyRepository requestSupplyRepo;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public void createIncidentReport(CreateIncidentRequest request, User leader) {
        //1. Lay request
        RescueRequest rescueRequest = requestRepo.findById(request.getRescueRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhiệm vụ."));

        //Chi leader team moi duoc bao cao
        if (rescueRequest.getAssignedTeam() == null ||
            !rescueRequest.getAssignedTeam().getLeader().getId().equals(leader.getId())){
            throw new IllegalStateException("Chỉ Đội trưởng của nhiệm vụ này mới được phép báo cáo sự cố.");
        }

        //2. upload anh
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

        //3. tao bao cao
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
        RescueTeam team = rescueRequest.getAssignedTeam();
        RescueTeam fallbackTeamFromReporter = incidentReport.getReportedBy() != null
                ? incidentReport.getReportedBy().getRescueTeam()
                : null;

        RescueTeam teamToRelease = team != null ? team : fallbackTeamFromReporter;
        Vehicle vehicle = rescueRequest.getAssignedVehicle();

        if (resolveRequest.getAction() == IncidentAction.ABORT){
            //1. giai phong team cu ve AVAILABLE
            if (teamToRelease != null){
                teamToRelease.setStatus(TeamStatus.AVAILABLE);
                teamRepo.save(teamToRelease);
            }

            //2. Thu hoi toan bo vat tu vao kho (trước khi xử lý vehicle)
            List<RequestSupply> requestSupplies = requestSupplyRepo.findByRequest(rescueRequest);
            for (RequestSupply rs : requestSupplies) {
                Supply supply = rs.getSupply();
                supply.setQuantity(supply.getQuantity() + rs.getQuantity());
                supplyRepo.save(supply);
            }
            //Xoa lich su xuat kho cua request nay vi nvu huy giua chung
            requestSupplyRepo.deleteAll(requestSupplies);

            //3. Xu ly phuong tien cu
            Vehicle vehicleForReassign = null;
            if (vehicle != null){
                // Nếu coordinator chọn MAINTENANCE hoặc trạng thái khác, đừng dùng vehicle này
                if (resolveRequest.getVehicleStatus() != null && 
                    !resolveRequest.getVehicleStatus().equals("AVAILABLE")) {
                    vehicle.setStatus(VehicleStatus.valueOf(resolveRequest.getVehicleStatus()));
                    vehicle.setCurrentTeam(null);
                    vehicleRepo.save(vehicle);
                    // Không dùng vehicle này cho team mới
                } else {
                    // Nếu AVAILABLE, giữ lại để gán cho team mới
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                    vehicleForReassign = vehicle;  // Sẽ dùng sau
                }
            }

            //4. Gan doi moi neu coordinator chon reassign
            if (resolveRequest.getNewTeamId() != null) {
                RescueTeam newTeam = teamRepo.findById(resolveRequest.getNewTeamId())
                        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đội mới để reassign."));

                // Kiểm tra xem đội mới có sẵn sàng không
                if (newTeam.getStatus() != TeamStatus.AVAILABLE) {
                    throw new IllegalStateException("Đội " + newTeam.getName() + " không sẵn sàng (trạng thái: " + newTeam.getStatus() + ")");
                }

                // Gán đội mới vào request
                rescueRequest.setAssignedTeam(newTeam);
                
                // Set đội mới thành BUSY
                newTeam.setStatus(TeamStatus.BUSY);
                teamRepo.save(newTeam);
                
                // Gán vehicle cho đội mới nếu có
                if (vehicleForReassign != null) {
                    vehicleForReassign.setCurrentTeam(newTeam);
                    vehicleRepo.save(vehicleForReassign);
                    rescueRequest.setAssignedVehicle(vehicleForReassign);
                }
                
                // Set request về VERIFIED (team mới chủ động nhận) hoặc IN_PROGRESS (sẵn sàng)
                // Dùng VERIFIED để team mới phải chủ động nhận
                rescueRequest.setStatus(RequestStatus.VERIFIED);

                // Ghi chú về reassign
                String oldNote = rescueRequest.getCoordinatorNote() != null ? rescueRequest.getCoordinatorNote() : "";
                String reassignNote = String.format("[%s - %s]: Sự cố đã được xử lý. Nhiệm vụ được gán lại cho đội %s.",
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                        coordinator.getFullName(),
                        newTeam.getName());
                rescueRequest.setCoordinatorNote(oldNote.isEmpty() ? reassignNote : oldNote + "\n" + reassignNote);
            } else {
                // Nếu không reassign, trả request về VERIFIED
                rescueRequest.setStatus(RequestStatus.VERIFIED);
                rescueRequest.setAssignedTeam(null);
                rescueRequest.setAssignedVehicle(null);

                //Note lai cho nguoi dan biet
                String oldNote = rescueRequest.getCoordinatorNote() != null ? rescueRequest.getCoordinatorNote() : "";
                String abortNote = String.format("[%s - %s]: Sự cố đã được báo cáo. Nhiệm vụ đang được điều phối lại cho đội khác.",
                        LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                        coordinator.getFullName());
                rescueRequest.setCoordinatorNote(oldNote.isEmpty() ? abortNote : oldNote + "\n" + abortNote);
            }

            requestRepo.save(rescueRequest);
        } else if (resolveRequest.getAction() == IncidentAction.CONTINUE){
            //Ep team sang BUSY de vuot qua rao can diem danh
            if (teamToRelease != null && teamToRelease.getStatus() != TeamStatus.BUSY){
                teamToRelease.setStatus(TeamStatus.BUSY);
                teamRepo.save(teamToRelease);
            }
        }

        //5. Cap nhat record su co
        incidentReport.setStatus(IncidentStatus.RESOLVED);
        incidentReport.setCoordinatorResponse(resolveRequest.getCoordinatorResponse());
        incidentReport.setCoordinatorAction(resolveRequest.getAction());
        incidentReport.setResolvedAt(LocalDateTime.now());
        incidentRepo.save(incidentReport);

        log.info("Coordinator {} đã giải quyết sự cố ID {} với hành động {}", coordinator.getEmail(), incidentId, resolveRequest.getAction());
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
        IncidentReport latestIncident = incidentRepo
                .findByRescueRequest_RequestIdOrderByCreatedAtDesc(requestId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo sự cố cho nhiệm vụ này."));

        String roleCode = requester.getRole() != null ? requester.getRole().getRoleCode() : "";
        boolean isCoordinatorSide = "COORDINATOR".equals(roleCode) || "ADMIN".equals(roleCode) || "MANAGER".equals(roleCode);

        if (!isCoordinatorSide) {
            if (latestIncident.getReportedBy() == null || !latestIncident.getReportedBy().getId().equals(requester.getId())) {
                throw new IllegalStateException("Bạn không có quyền xem báo cáo sự cố này.");
            }
        }

        return mapToResponse(latestIncident);
    }

    private IncidentReportResponse mapToResponse(IncidentReport incident) {
        String teamName = "Chưa rõ";
        if (incident.getRescueRequest() != null && incident.getRescueRequest().getAssignedTeam() != null) {
            teamName = incident.getRescueRequest().getAssignedTeam().getName();
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
