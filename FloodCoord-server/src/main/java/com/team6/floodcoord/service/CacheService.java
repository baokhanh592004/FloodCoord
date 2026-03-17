package com.team6.floodcoord.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.function.Supplier;

/**
 * Generic cache-aside service for all weather/flood data.
 *
 * Pattern:
 *  1. Check Redis for key
 *  2. HIT -> deserialize and return
 *  3. MISS -> call supplier (Open-Meteo API), store in Redis, return
 *
 * Redis failures are caught and logged - they NEVER break the app.
 * During a flood emergency, stale/missing cache falls through to live API data.
 * */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    //----------------- Key builders --------------------------

    /** Rounds to 2dp so nearby locations share cache entries */
    public String weatherCurrentKey(double lat, double lon) {
        return String.format("weather:forecast:%.2f:%.2f", lat, lon);
    }

    public String weatherForecastKey(double lat, double lon, int days) {
        return String.format("weather:forecast:%.2f:%.2f:%d", lat, lon, days);
    }

    public String floodDischargeKey(double lat, double lon) {
        return String.format("flood:discharge:%.2f:%.2f", lat, lon);
    }

    public String riskLevelKey(double lat, double lon) {
        return String.format("flood:risk:%.2f:%.2f", lat, lon);
    }

    //----------------- Core cache-aside ---------------------

    /**
     * Generic get-or-fetch.
     *
     * @param key Redis key
     * @param ttl Time-to-live for new entries
     * @param fetchFn Supplier called on cache miss (e.g. WebClient APi call
     * @param type Deserialization target class
     */
    public <T> T getOrFetch(String key, Duration ttl,
                            Supplier<T> fetchFn, Class<T> type) {
        // 1. Try cache
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                log.debug("Cache HIT: {}", key);
                return objectMapper.convertValue(cached, type);
            }
        } catch (Exception e) {
            log.warn("Redis read failed [key={}]: {} - falling through to API",
                    key, e.getMessage());
        }

        // 2. Cache miss - call API
        log.debug("Cache MISS: {}", key);
        T result = fetchFn.get();

        // 3. Store result (failures are non-fatal)
        try {
            if (result != null) {
                redisTemplate.opsForValue().set(key, result, ttl);
                log.debug("Cache SET: {} (TTL={})", key, ttl);
            }
        } catch (Exception e){
            log.warn("Redis write failed [key={}]: {}", key, e.getMessage());
        }

        return result;
    }

    //--------------- Eviction ----------------------------

    /** Force-evict a single key. Call this when rescue coordinators need fresh data.*/
    public void evict(String key) {
        try {
            redisTemplate.delete(key);
            log.info("Cache evicted: {}", key);
        } catch (Exception e) {
            log.warn("Cache evict failed: [key={}]: {}", key, e.getMessage());
        }
    }

    /** Evict all weather + flood cache entries for a specific location */
    public void evictLocation(double lat, double lon) {
        evict(weatherCurrentKey(lat, lon));
        evict(weatherForecastKey(lat, lon, 7));
        evict(weatherForecastKey(lat, lon, 16));
        evict(floodDischargeKey(lat, lon));
        evict(riskLevelKey(lat, lon));
        log.info("All cache evicted for location [{}, {}]", lat, lon);
    }

    /** Evict all weather-related keys across all locations */
    public void evictAll() {
        try {
            Set<String> weatherKeys = redisTemplate.keys("weather:*");
            Set<String> floodKeys = redisTemplate.keys("flood:*");
            if (weatherKeys != null && !weatherKeys.isEmpty()) {
                redisTemplate.delete(weatherKeys);
                log.info("Evicted {} weather cache entries", weatherKeys.size());
            }
            if (floodKeys != null && !floodKeys.isEmpty()) {
                redisTemplate.delete(floodKeys);
                log.info("Evicted {} flood cache entries", floodKeys.size());
            }
        } catch (Exception e) {
            log.warn("Cache evict-all failed: {}", e.getMessage());
        }
    }

    //-------------- Health ----------------------
    public boolean isRedisAvailable() {
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
