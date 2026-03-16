package com.team6.floodcoord.mapper;

import com.team6.floodcoord.dto.response.RequestMediaResponse;
import com.team6.floodcoord.model.RequestMedia;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-16T16:16:58+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 24.0.1 (Oracle Corporation)"
)
@Component
public class RequestMediaMapperImpl implements RequestMediaMapper {

    @Override
    public RequestMediaResponse toDTO(RequestMedia media) {
        if ( media == null ) {
            return null;
        }

        RequestMediaResponse requestMediaResponse = new RequestMediaResponse();

        requestMediaResponse.setMediaId( media.getMediaId() );
        requestMediaResponse.setMediaType( media.getMediaType() );
        requestMediaResponse.setMediaUrl( media.getMediaUrl() );
        requestMediaResponse.setUploadedAt( media.getUploadedAt() );

        return requestMediaResponse;
    }
}
