package com.team6.floodcoord.model;

import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@RedisHash("BlacklistedAccessToken")
@Builder
public class BlackListedAccessToken {

    @Id
    private String jwtId;

    @TimeToLive
    private Long timeToLiveSeconds;
}
