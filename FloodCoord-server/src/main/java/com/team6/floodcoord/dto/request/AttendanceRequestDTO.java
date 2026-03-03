package com.team6.floodcoord.dto.request;



import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AttendanceRequestDTO {
    private UUID requestId;
    private List<AttendanceItemDTO> attendanceList;
}
