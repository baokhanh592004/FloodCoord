package com.team6.floodcoord.dto.response;


import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDetailDTO {
    private Integer rescuedPeople;
    private String reportNote;
    private LocalDateTime reportedAt;
    private String leaderName;
}
