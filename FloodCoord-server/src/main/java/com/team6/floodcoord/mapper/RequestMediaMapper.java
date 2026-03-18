package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.RequestMediaResponse;
import com.team6.floodcoord.model.RequestMedia;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RequestMediaMapper {

    RequestMediaResponse toDTO(RequestMedia media);

}
