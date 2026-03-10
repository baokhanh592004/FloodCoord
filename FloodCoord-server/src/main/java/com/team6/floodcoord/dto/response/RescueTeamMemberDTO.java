package com.team6.floodcoord.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RescueTeamMemberDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private Boolean isTeamLeader;


}