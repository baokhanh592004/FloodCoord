package com.team6.floodcoord.configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Configuration
public class RedisConfiguration {
    @Value("${data.redis.host}")
    private String host;

    @Value("${data.redis.port}")
    private int port;

    @Value("${data.redis.password:}")
    private String password;

    @Value("${data.redis.ssl:false}")
    private boolean useSsl;

    @Value("${weather.cache.ttl-minutes:30}")
    private long cacheTtlMinutes;

    @Value("${weather.cache.forecast-ttl-hours:1}")
    private long forecastTtlHours;

    @Value("${weather.cache.risk-ttl-minutes:15}")
    private long riskTtlMinutes;

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
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host, port);
        if (StringUtils.hasText(password)) {
            redisConfig.setPassword(RedisPassword.of(password));
        }

        LettuceClientConfiguration.LettuceClientConfigurationBuilder builder = LettuceClientConfiguration.builder();
        if (useSsl) {
            builder.useSsl();
            log.info("Redis kết nối qua chế độ bảo mật SSL/TLS");
        } else {
            log.info("Redis kết nối qua chế độ thông thường (Plain Text)");
        }

        LettuceClientConfiguration clientConfig = builder.build();

        return new LettuceConnectionFactory(redisConfig, clientConfig);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory){
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        GenericJackson2JsonRedisSerializer jsonRedisSerializer =
                new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(cacheTtlMinutes))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Per-cache TTL overides
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("weather_current",
                defaultConfig.entryTtl(Duration.ofMinutes(cacheTtlMinutes)));
        cacheConfigs.put("weather_forecast",
                defaultConfig.entryTtl(Duration.ofHours(forecastTtlHours)));
        cacheConfigs.put("flood_discharge",
                defaultConfig.entryTtl(Duration.ofMinutes(cacheTtlMinutes)));
        cacheConfigs.put("risk_level",
                defaultConfig.entryTtl(Duration.ofMinutes(riskTtlMinutes)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .build();
    }
}