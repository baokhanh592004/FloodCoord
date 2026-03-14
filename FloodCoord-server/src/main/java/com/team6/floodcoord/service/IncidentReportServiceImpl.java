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
        Vehicle vehicle = rescueRequest.getAssignedVehicle();

        if (resolveRequest.getAction() == IncidentAction.ABORT){
            //1. giai phong team ve AVAILABLE
            if (team != null){
                team.setStatus(TeamStatus.AVAILABLE);
                teamRepo.save(team);
            }

            //2. Xu ly phuong tien
            if (vehicle != null){
                if (resolveRequest.getVehicleStatus() != null){
                    vehicle.setStatus(VehicleStatus.valueOf(resolveRequest.getVehicleStatus()));
                } else {
                    vehicle.setStatus(VehicleStatus.AVAILABLE);
                }
                //rut xe khoi doi
                vehicle.setCurrentTeam(null);
                vehicleRepo.save(vehicle);
            }
            //3. Thu hoi toan bo vat tu vao kho
            List<RequestSupply> requestSupplies = requestSupplyRepo.findByRequest(rescueRequest);
            for (RequestSupply rs : requestSupplies) {
                Supply supply = rs.getSupply();
                supply.setQuantity(supply.getQuantity() + rs.getQuantity());
                supplyRepo.save(supply);
            }
            //Xoa lich su xuat kho cua request nay vi nvu huy giua chung
            requestSupplyRepo.deleteAll(requestSupplies);

            //4. Tra nhiem vu ve VERIFIED, cat lien ket team, vehicle
            rescueRequest.setStatus(RequestStatus.VERIFIED);
            rescueRequest.setAssignedTeam(null);
            rescueRequest.setAssignedVehicle(null);

            //Note lai cho nguoi dan biet
            String oldNote = rescueRequest.getCoordinatorNote() != null ? rescueRequest.getCoordinatorNote() : "";
            String abortNote = String.format("[%s - %s]: Xảy ra sự cố. Nhiệm vụ đang được điều phối lại cho đội khác.",
                    LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                    coordinator.getFullName());
            rescueRequest.setCoordinatorNote(oldNote.isEmpty() ? abortNote : oldNote + "\n" + abortNote);

            requestRepo.save(rescueRequest);
        } else if (resolveRequest.getAction() == IncidentAction.CONTINUE){
            //Ep team sang BUSY de vuot qua rao can diem danh
            if (team != null && team.getStatus() != TeamStatus.BUSY){
                team.setStatus(TeamStatus.BUSY);
                teamRepo.save(team);
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
