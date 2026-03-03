package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.AttendanceRequestDTO;
import com.team6.floodcoord.dto.response.AttendanceResponseDTO;
import com.team6.floodcoord.model.Attendance;

import java.util.List;
import java.util.UUID;

public interface TeamLeaderService {
    void markAttendance(AttendanceRequestDTO request);

    List<AttendanceResponseDTO> getAttendanceByRescue(UUID requestId);
}
