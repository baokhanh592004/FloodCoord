package com.team6.floodcoord.dto.response;

import com.team6.floodcoord.model.enums.AttendanceStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceResponseDTO {

    private Long memberId;
    private String memberName;
    private AttendanceStatus status;
}