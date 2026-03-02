package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data

public class AttendanceItemDTO {

    private Long memberId;
    @NotNull
    private AttendanceStatus status; // PRESENT hoặc ABSENT
}
