package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AttendanceItemDTO;
import com.team6.floodcoord.dto.request.AttendanceRequestDTO;
import com.team6.floodcoord.dto.response.AttendanceResponseDTO;
import com.team6.floodcoord.model.Attendance;
import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.model.RescueTeam;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.enums.RequestStatus;
import com.team6.floodcoord.model.enums.TeamStatus;
import com.team6.floodcoord.repository.AttendanceRepository;
import com.team6.floodcoord.repository.RescueRequestRepository;
import com.team6.floodcoord.repository.RescueTeamRepository;
import com.team6.floodcoord.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                        .build()
                )
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

        // Nếu completed thì trả team về available
        if (newStatus == RequestStatus.COMPLETED) {
            team.setStatus(TeamStatus.AVAILABLE);
            rescueTeamRepository.save(team);
        }
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

            default -> throw new RuntimeException("Cannot update from this status");
        }
    }
}