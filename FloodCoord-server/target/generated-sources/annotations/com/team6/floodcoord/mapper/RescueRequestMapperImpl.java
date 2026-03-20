package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.AssignedSupplyResponse;
import com.team6.floodcoord.dto.response.CompletedRequestDTO;
import com.team6.floodcoord.dto.response.RequestMediaResponse;
import com.team6.floodcoord.model.RequestMedia;
import com.team6.floodcoord.model.RequestSupply;
import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.model.RescueTeam;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.utils.VehicleMapper;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-19T20:29:46+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class RescueRequestMapperImpl implements RescueRequestMapper {

    @Autowired
    private AssignedSupplyMapper assignedSupplyMapper;
    @Autowired
    private RequestMediaMapper requestMediaMapper;
    @Autowired
    private RequestLocationMapper requestLocationMapper;
    @Autowired
    private RescueReportMapper rescueReportMapper;

    @Override
    public CompletedRequestDTO toCompletedDTO(RescueRequest request) {
        if ( request == null ) {
            return null;
        }

        CompletedRequestDTO.CompletedRequestDTOBuilder completedRequestDTO = CompletedRequestDTO.builder();

        completedRequestDTO.media( requestMediaListToRequestMediaResponseList( request.getMediaList() ) );
        completedRequestDTO.vehicle( VehicleMapper.mapToResponse( request.getAssignedVehicle() ) );
        completedRequestDTO.report( rescueReportMapper.toReportDTO( request.getReport() ) );
        completedRequestDTO.assignedTeamId( requestAssignedTeamId( request ) );
        completedRequestDTO.assignedTeamName( requestAssignedTeamName( request ) );
        completedRequestDTO.assignedTeamLeaderPhone( requestAssignedTeamLeaderPhoneNumber( request ) );
        completedRequestDTO.requestId( request.getRequestId() );
        completedRequestDTO.trackingCode( request.getTrackingCode() );
        completedRequestDTO.title( request.getTitle() );
        completedRequestDTO.emergencyLevel( request.getEmergencyLevel() );
        completedRequestDTO.contactName( request.getContactName() );
        completedRequestDTO.contactPhone( request.getContactPhone() );
        completedRequestDTO.description( request.getDescription() );
        completedRequestDTO.peopleCount( request.getPeopleCount() );
        completedRequestDTO.status( request.getStatus() );
        completedRequestDTO.createdAt( request.getCreatedAt() );
        completedRequestDTO.completedAt( request.getCompletedAt() );
        completedRequestDTO.citizenFeedback( request.getCitizenFeedback() );
        completedRequestDTO.citizenRating( request.getCitizenRating() );
        completedRequestDTO.location( requestLocationMapper.toDTO( request.getLocation() ) );
        completedRequestDTO.supplies( requestSupplyListToAssignedSupplyResponseList( request.getSupplies() ) );

        return completedRequestDTO.build();
    }

    protected List<RequestMediaResponse> requestMediaListToRequestMediaResponseList(List<RequestMedia> list) {
        if ( list == null ) {
            return null;
        }

        List<RequestMediaResponse> list1 = new ArrayList<RequestMediaResponse>( list.size() );
        for ( RequestMedia requestMedia : list ) {
            list1.add( requestMediaMapper.toDTO( requestMedia ) );
        }

        return list1;
    }

    private Long requestAssignedTeamId(RescueRequest rescueRequest) {
        if ( rescueRequest == null ) {
            return null;
        }
        RescueTeam assignedTeam = rescueRequest.getAssignedTeam();
        if ( assignedTeam == null ) {
            return null;
        }
        Long id = assignedTeam.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String requestAssignedTeamName(RescueRequest rescueRequest) {
        if ( rescueRequest == null ) {
            return null;
        }
        RescueTeam assignedTeam = rescueRequest.getAssignedTeam();
        if ( assignedTeam == null ) {
            return null;
        }
        String name = assignedTeam.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String requestAssignedTeamLeaderPhoneNumber(RescueRequest rescueRequest) {
        if ( rescueRequest == null ) {
            return null;
        }
        RescueTeam assignedTeam = rescueRequest.getAssignedTeam();
        if ( assignedTeam == null ) {
            return null;
        }
        User leader = assignedTeam.getLeader();
        if ( leader == null ) {
            return null;
        }
        String phoneNumber = leader.getPhoneNumber();
        if ( phoneNumber == null ) {
            return null;
        }
        return phoneNumber;
    }

    protected List<AssignedSupplyResponse> requestSupplyListToAssignedSupplyResponseList(List<RequestSupply> list) {
        if ( list == null ) {
            return null;
        }

        List<AssignedSupplyResponse> list1 = new ArrayList<AssignedSupplyResponse>( list.size() );
        for ( RequestSupply requestSupply : list ) {
            list1.add( assignedSupplyMapper.toDTO( requestSupply ) );
        }

        return list1;
    }
}
