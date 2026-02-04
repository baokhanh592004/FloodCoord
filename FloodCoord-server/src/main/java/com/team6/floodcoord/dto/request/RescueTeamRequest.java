package com.team6.floodcoord.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RescueTeamRequest {
    private String name;
    private String description;
    private Long leaderId; // ID của user làm đội trưởng
    private List<Long> memberIds; // Danh sách ID các thành viên muốn thêm vào đội
}
