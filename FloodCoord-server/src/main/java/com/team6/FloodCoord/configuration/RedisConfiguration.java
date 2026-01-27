package com.team6.floodcoord.configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
public class RedisConfiguration {
    @Value("${data.redis.host}")
    private String host;

    @Value("${data.redis.port}")
    private int port;

    @PostConstruct
    public void validateConfiguration(){
        if (!StringUtils.hasText(host)){
            throw new IllegalStateException("Redis host is not configured");
        }

        if (port <= 0 || port >= 65535){
            throw new IllegalStateException(
                    String.format("Invalid redis port: %d. Port must be between 1 and 65535", port)
            );
        }
        log.info("Redis configuration validated - Host: {}, Port {}", host, port);
    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host,port);
        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig);
        log.info("Redis connection factory created successfully");

        return factory;
    }


}
