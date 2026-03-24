package com.team6.floodcoord.repository.redis;

import com.team6.floodcoord.model.BlackListedAccessToken;
import org.springframework.data.keyvalue.repository.KeyValueRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlacklistedAccessTokenRepository extends KeyValueRepository<BlackListedAccessToken, String> {
}
