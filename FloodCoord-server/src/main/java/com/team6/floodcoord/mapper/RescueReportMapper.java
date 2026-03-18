package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.ReportDetailDTO;
import com.team6.floodcoord.model.RescueReport;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RescueReportMapper {

    @Mapping(source = "leader.fullName", target = "leaderName")
    ReportDetailDTO toReportDTO(RescueReport report);

}