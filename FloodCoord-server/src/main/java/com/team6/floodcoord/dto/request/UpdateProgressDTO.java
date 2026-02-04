package com.team6.floodcoord.dto.request;

import com.team6.floodcoord.model.enums.RequestStatus;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProgressDTO {
    private RequestStatus status; // Trạng thái mới (MOVING, ARRIVED, RESCUING...)
    private String note;          // Báo cáo tiến độ (VD: "Đường ngập sâu, đi chậm")
    private List<MediaDTO> media; // Hình ảnh/Video hiện trường (nếu có)
}
