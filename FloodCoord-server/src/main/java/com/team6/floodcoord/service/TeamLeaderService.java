package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AttendanceRequestDTO;
import com.team6.floodcoord.dto.request.ReportRequestDTO;
import com.team6.floodcoord.dto.response.AttendanceResponseDTO;
import com.team6.floodcoord.model.Attendance;
import com.team6.floodcoord.model.enums.RequestStatus;

import java.util.List;
import java.util.UUID;

public interface TeamLeaderService {
    void markAttendance(AttendanceRequestDTO request);

    List<AttendanceResponseDTO> getAttendanceByRescue(UUID requestId);

    public void updateRescueStatus(UUID requestId, RequestStatus newStatus);

    public void submitReport(ReportRequestDTO dto);
}
