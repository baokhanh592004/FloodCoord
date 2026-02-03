package com.team6.floodcoord.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class CreateRescueRequestDTO {
    private String title;
    private String description;
    private String emergencyLevel;
    private int peopleCount;
    // 👤 Thông tin người gửi (QUAN TRỌNG)
    @NotBlank(message = "Tên người gửi không được để trống")
    private String contactName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(0|\\+84)[0-9]{9}$",
            message = "Số điện thoại không hợp lệ"
    )
    private String contactPhone;
    private LocationDTO location;
    private List<MediaDTO> mediaUrls;
}

