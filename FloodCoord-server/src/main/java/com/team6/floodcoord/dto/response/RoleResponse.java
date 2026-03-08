package com.team6.floodcoord.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleResponse {
    private Long id;
    private String roleName;
    private String roleCode;
    private String description;
}
