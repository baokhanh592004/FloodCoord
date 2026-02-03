package com.team6.floodcoord.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String password;
    private Long roleId; // tạm thời ADMIN sẽ gán role
}