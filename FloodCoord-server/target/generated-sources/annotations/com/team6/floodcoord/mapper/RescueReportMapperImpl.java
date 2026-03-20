package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.ReportDetailDTO;
import com.team6.floodcoord.model.RescueReport;
import com.team6.floodcoord.model.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-19T20:29:47+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class RescueReportMapperImpl implements RescueReportMapper {

    @Override
    public ReportDetailDTO toReportDTO(RescueReport report) {
        if ( report == null ) {
            return null;
        }

        ReportDetailDTO.ReportDetailDTOBuilder reportDetailDTO = ReportDetailDTO.builder();

        reportDetailDTO.leaderName( reportLeaderFullName( report ) );
        reportDetailDTO.rescuedPeople( report.getRescuedPeople() );
        reportDetailDTO.reportNote( report.getReportNote() );
        reportDetailDTO.reportedAt( report.getReportedAt() );

        return reportDetailDTO.build();
    }

    private String reportLeaderFullName(RescueReport rescueReport) {
        if ( rescueReport == null ) {
            return null;
        }
        User leader = rescueReport.getLeader();
        if ( leader == null ) {
            return null;
        }
        String fullName = leader.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }
}
