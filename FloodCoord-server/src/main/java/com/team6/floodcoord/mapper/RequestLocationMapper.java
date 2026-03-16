package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.RequestLocationResponse;
import com.team6.floodcoord.model.RequestLocation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RequestLocationMapper {

    RequestLocationResponse toDTO(RequestLocation location);

}
