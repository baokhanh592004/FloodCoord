package com.team6.floodcoord.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String fullName;
    private String phoneNumber;
    private Boolean status;
    private Long roleId;
}
