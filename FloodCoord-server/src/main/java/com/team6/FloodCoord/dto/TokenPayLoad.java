package com.team6.floodcoord.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Builder
public class TokenPayLoad {
    private String token;
    private String jwtId;
    private Date expiredTime;
}
