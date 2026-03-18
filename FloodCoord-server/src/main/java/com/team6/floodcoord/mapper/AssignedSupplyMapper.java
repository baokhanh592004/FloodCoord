package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.AssignedSupplyResponse;
import com.team6.floodcoord.model.RequestSupply;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssignedSupplyMapper {

    @Mapping(source = "supply.id", target = "supplyId")
    @Mapping(source = "supply.name", target = "supplyName")
    @Mapping(source = "supply.unit", target = "unit")
    AssignedSupplyResponse toDTO(RequestSupply requestSupply);

}
