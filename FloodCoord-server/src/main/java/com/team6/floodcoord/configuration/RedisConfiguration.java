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
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisKeyValueAdapter;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.util.StringUtils;
import org.springframework.data.redis.core.RedisKeyValueTemplate;
import org.springframework.data.redis.core.mapping.RedisMappingContext;

import java.net.URI;
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
//Dùng REDIS_URL thay vì host/port
//    @Value("${REDIS_URL}")
//    private String redisUrl;
//    private String host;
//    private int port;

    @Value("${weather.cache.ttl-minutes:30}")
    private long cacheTtlMinutes;

    @Value("${weather.cache.forecast-ttl-hours:1}")
    private long forecastTtlHours;

    @Value("${weather.cache.risk-ttl-minutes:15}")
    private long riskTtlMinutes;

    @PostConstruct
    public void validateConfiguration() {
//        try {
//            URI uri = new URI(redisUrl);
//            this.host = uri.getHost();
//            this.port = uri.getPort();
//
//            if (!StringUtils.hasText(host)) {
//                throw new IllegalStateException("Redis host is not configured");
//            }
//
//            if (port <= 0 || port >= 65535) {
//                throw new IllegalStateException("Invalid redis port: " + port);
//            }
//
//            log.info("Redis ready - Host: {}, Port: {}", host, port);
//
//        } catch (Exception e) {
//            throw new RuntimeException("Invalid REDIS_URL format", e);
//        }
        if (!StringUtils.hasText(host)) {
            throw new IllegalStateException("Redis host is not configured");
        }
        if (port <= 0 || port >= 65535) {
            throw new IllegalStateException(String.format("Invalid redis port: %d. Port must be between 1 and 65535", port));
        }
        log.info("Redis configuration validated - Host: {}, Port {}", host, port);
    }
//    @PostConstruct
//    public void parseRedisUrl() {
//        try {
//            URI uri = new URI(redisUrl);
//            this.host = uri.getHost();
//            this.port = uri.getPort();
//
//            log.info("Redis parsed - Host: {}, Port: {}", host, port);
//        } catch (Exception e) {
//            throw new RuntimeException("Invalid REDIS_URL format", e);
//        }
//    }

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
//        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration(host,port);
//        LettuceConnectionFactory factory = new LettuceConnectionFactory(redisConfig);
//        log.info("Redis connection factory created successfully");

//        return factory;
        RedisStandaloneConfiguration config =
                new RedisStandaloneConfiguration(host, port);

        return new LettuceConnectionFactory(config);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
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

    @Bean
    public RedisKeyValueTemplate redisKeyValueTemplate(RedisTemplate<String, Object> redisTemplate) {

        RedisKeyValueAdapter adapter = new RedisKeyValueAdapter(redisTemplate);

        RedisMappingContext context = new RedisMappingContext();

        return new RedisKeyValueTemplate(adapter, context);
    }
}
