package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AssignSupplyDTO;
import com.team6.floodcoord.dto.request.AssignTaskRequest;
import com.team6.floodcoord.dto.request.RescueTeamRequest;
import com.team6.floodcoord.dto.response.RescueTeamResponse;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.model.enums.VehicleStatus;
import com.team6.floodcoord.repository.*;
import com.team6.floodcoord.utils.RescueTeamMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RescueTeamServiceImpl implements RescueTeamService{
    private final RescueTeamRepository teamRepo;
    private final UserRepository userRepo;
    private final RescueRequestRepository requestRepo;
    private final VehicleRepository vehicleRepo;
    private final SupplyRepository supplyRepo;
    private final RequestSupplyRepository requestSupplyRepo;

    @Override
    public RescueTeamResponse createTeam(RescueTeamRequest request) {
        if (teamRepo.existsByName(request.getName())) {
            throw new IllegalArgumentException("Team name already exists: " + request.getName());
        }

        RescueTeam team = new RescueTeam();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setIsActive(true);

        // Lưu trước để có ID
        team = teamRepo.save(team);

        // Xử lý Leader
        if (request.getLeaderId() != null) {
            assignLeader(team, request.getLeaderId());
        }

        // Xử lý Members
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            addMembers(team, request.getMemberIds());
        }

        // Refresh lại từ DB để lấy danh sách members đầy đủ
        return RescueTeamMapper.mapToResponse(teamRepo.findById(team.getId()).orElseThrow());
    }

    @Override
    public RescueTeamResponse updateTeam(Long id, RescueTeamRequest request) {
        RescueTeam team = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (request.getName() != null && !team.getName().equals(request.getName())) {
            if (teamRepo.existsByName(request.getName())) {
                throw new IllegalArgumentException("Team name already exists");
            }
            team.setName(request.getName());
        }

        if (request.getDescription() != null) team.setDescription(request.getDescription());

        // Update Leader
        if (request.getLeaderId() != null) {
            assignLeader(team, request.getLeaderId());
        }

        // Update Members (Cộng thêm vào danh sách cũ)
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            addMembers(team, request.getMemberIds());
        }

        return RescueTeamMapper.mapToResponse(teamRepo.save(team));
    }

    @Override
    public RescueTeamResponse getTeamById(Long id) {
        RescueTeam team = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        return RescueTeamMapper.mapToResponse(team);
    }

    @Override
    public List<RescueTeamResponse> getAllTeams() {
        return teamRepo.findAll().stream()
                .map(RescueTeamMapper::mapToResponse) // SỬ DỤNG METHOD REFERENCE
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTeam(Long id) {
        RescueTeam team = teamRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Logic: Giải phóng các thành viên trước khi xóa đội
        List<User> members = team.getMembers();
        if (members != null) {
            for (User u : members) {
                u.setRescueTeam(null);
            }
            userRepo.saveAll(members);
        }

        teamRepo.delete(team);
    }

    @Override
    public void removeMemberFromTeam(Long teamId, Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRescueTeam() != null && user.getRescueTeam().getId().equals(teamId)) {
            user.setRescueTeam(null);

            // Nếu người bị xóa là Leader, set leader của team về null
            RescueTeam team = user.getRescueTeam(); // Lưu ý: lúc này object user chưa update DB
            // Lấy lại team từ DB cho chắc
            RescueTeam dbTeam = teamRepo.findById(teamId).orElseThrow();
            if (dbTeam.getLeader() != null && dbTeam.getLeader().getId().equals(userId)) {
                dbTeam.setLeader(null);
                teamRepo.save(dbTeam);
            }

            userRepo.save(user);
        }
    }

    private void assignLeader(RescueTeam team, Long leaderId) {
        User leader = userRepo.findById(leaderId)
                .orElseThrow(() -> new RuntimeException("Leader User not found"));

        // Logic business: Check xem user có role RESCUE_TEAM hay không (tùy chọn)
        // if (!leader.getRole().getRoleCode().equals("RESCUE_TEAM")) throw ...

        team.setLeader(leader);
        leader.setRescueTeam(team); // Leader cũng phải thuộc team
        userRepo.save(leader);
    }

    private void addMembers(RescueTeam team, List<Long> memberIds) {
        List<User> users = userRepo.findAllById(memberIds);
        for (User u : users) {
            u.setRescueTeam(team);
        }
        userRepo.saveAll(users);
    }
}
