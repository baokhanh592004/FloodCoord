package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.CompletedRequestDTO;
import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.utils.VehicleMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",uses = {
        AssignedSupplyMapper.class,
        RequestMediaMapper.class,
        RequestLocationMapper.class,
        VehicleMapper.class,
        RescueReportMapper.class


})
public interface RescueRequestMapper {
    @Mapping(source = "mediaList", target = "media")
    @Mapping(source = "assignedVehicle", target = "vehicle")
    @Mapping(source = "report", target = "report")
    @Mapping(source = "assignedTeam.id", target = "assignedTeamId")
    @Mapping(source = "assignedTeam.name", target = "assignedTeamName")
    @Mapping(source = "assignedTeam.leader.phoneNumber", target = "assignedTeamLeaderPhone")
    CompletedRequestDTO toCompletedDTO(RescueRequest request);

}
