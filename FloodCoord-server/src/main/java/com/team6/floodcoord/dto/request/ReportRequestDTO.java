package com.team6.floodcoord.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
@Getter
@Setter
public class ReportRequestDTO {

//    private UUID requestId;
//    private Integer rescuedPeople;
//    private String note;
//
//    private List<SupplyRemainDTO> remainSupplies;
    private UUID requestId;

    private Integer rescuedPeople;

    private String note;

    private List<SupplyRemainDTO> remainSupplies;

    @Schema(type = "string", format = "binary",description = "Upload images or videos")
    @JsonIgnore
    private MultipartFile[] mediaFiles;
}
