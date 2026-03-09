package com.team6.floodcoord.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SupplyRemainDTO {
    private Long requestSupplyId;
    @Min(value = 0, message = "Remaining quantity cannot be negative")
    private Integer remainingQuantity;
}
