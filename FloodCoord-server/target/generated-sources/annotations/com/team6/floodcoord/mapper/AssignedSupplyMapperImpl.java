package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.AssignedSupplyResponse;
import com.team6.floodcoord.model.RequestSupply;
import com.team6.floodcoord.model.Supply;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-17T13:08:14+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Oracle Corporation)"
)
@Component
public class AssignedSupplyMapperImpl implements AssignedSupplyMapper {

    @Override
    public AssignedSupplyResponse toDTO(RequestSupply requestSupply) {
        if ( requestSupply == null ) {
            return null;
        }

        AssignedSupplyResponse assignedSupplyResponse = new AssignedSupplyResponse();

        assignedSupplyResponse.setSupplyId( requestSupplySupplyId( requestSupply ) );
        assignedSupplyResponse.setSupplyName( requestSupplySupplyName( requestSupply ) );
        assignedSupplyResponse.setUnit( requestSupplySupplyUnit( requestSupply ) );
        assignedSupplyResponse.setQuantity( requestSupply.getQuantity() );

        return assignedSupplyResponse;
    }

    private Long requestSupplySupplyId(RequestSupply requestSupply) {
        if ( requestSupply == null ) {
            return null;
        }
        Supply supply = requestSupply.getSupply();
        if ( supply == null ) {
            return null;
        }
        Long id = supply.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String requestSupplySupplyName(RequestSupply requestSupply) {
        if ( requestSupply == null ) {
            return null;
        }
        Supply supply = requestSupply.getSupply();
        if ( supply == null ) {
            return null;
        }
        String name = supply.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String requestSupplySupplyUnit(RequestSupply requestSupply) {
        if ( requestSupply == null ) {
            return null;
        }
        Supply supply = requestSupply.getSupply();
        if ( supply == null ) {
            return null;
        }
        String unit = supply.getUnit();
        if ( unit == null ) {
            return null;
        }
        return unit;
    }
}
