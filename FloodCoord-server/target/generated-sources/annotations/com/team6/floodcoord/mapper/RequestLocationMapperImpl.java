package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.RequestLocationResponse;
import com.team6.floodcoord.model.RequestLocation;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-19T20:29:47+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.17 (Eclipse Adoptium)"
)
@Component
public class RequestLocationMapperImpl implements RequestLocationMapper {

    @Override
    public RequestLocationResponse toDTO(RequestLocation location) {
        if ( location == null ) {
            return null;
        }

        RequestLocationResponse requestLocationResponse = new RequestLocationResponse();

        requestLocationResponse.setLatitude( location.getLatitude() );
        requestLocationResponse.setLongitude( location.getLongitude() );
        requestLocationResponse.setAddressText( location.getAddressText() );
        requestLocationResponse.setFloodDepth( location.getFloodDepth() );

        return requestLocationResponse;
    }
}
