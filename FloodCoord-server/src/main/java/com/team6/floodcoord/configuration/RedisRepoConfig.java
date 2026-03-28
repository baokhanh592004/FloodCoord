package com.team6.floodcoord.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@Configuration
@EnableRedisRepositories(
        basePackages = "com.team6.floodcoord.repository.redis"
)
public class RedisRepoConfig {
}