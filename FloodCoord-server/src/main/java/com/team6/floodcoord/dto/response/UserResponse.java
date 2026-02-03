package com.team6.floodcoord.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserResponse {
    private long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Boolean status;
    private String roleName;
}
