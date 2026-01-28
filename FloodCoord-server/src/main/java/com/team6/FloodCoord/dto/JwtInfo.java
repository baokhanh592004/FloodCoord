package com.team6.floodcoord.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtInfo {
    private String jwtId;
    private Date issueTime;
    private Date expiredTime;

}
