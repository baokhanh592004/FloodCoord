package com.team6.floodcoord.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.team6.floodcoord.dto.JwtInfo;
import com.team6.floodcoord.dto.TokenPayLoad;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.repository.BlacklistedAccessTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    private final static JWSAlgorithm SIGNATURE_ALGORITHM = JWSAlgorithm.HS512;
    private final static int ACCESS_TOKEN_VALIDITY_MINUTES = 15;
    private final static int REFRESH_TOKEN_VALIDITY_DAYS = 14;

    @Value("${jwt.secret-key}")
    private String secretKey;

    private final BlacklistedAccessTokenRepository blacklistedAccessTokenRepository;

    @Override
    public TokenPayLoad generateAccessToken(User user) {
        log.debug("Generating access token for user ID: {}", user.getId());

        Date issueTime = new Date();
        Date expiredTime = Date.from(issueTime.toInstant().plus(ACCESS_TOKEN_VALIDITY_MINUTES, ChronoUnit.MINUTES));

        String roleCode = user.getRole() != null ? user.getRole().getRoleCode() : "USER";

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(String.valueOf(user.getId()))
                .issueTime(issueTime)
                .expirationTime(expiredTime)
                .claim("roles", Collections.singletonList(roleCode));

        TokenPayLoad token = generateToken(claimsBuilder, expiredTime);
        log.debug("Access token generated successfully for user ID: {}", user.getId());

        return token;
    }

    @Override
    public TokenPayLoad generateRefreshToken(User user) {
        log.debug("Generating refresh token for user ID: {}", user.getId());

        Date issueTime = new Date();
        Date expiredTime = Date.from(issueTime.toInstant().plus(REFRESH_TOKEN_VALIDITY_DAYS, ChronoUnit.DAYS));

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(String.valueOf(user.getId()))
                .issueTime(issueTime)
                .expirationTime(expiredTime);

        TokenPayLoad token = generateToken(claimsBuilder, expiredTime);
        log.debug("Refresh token generated successfully for user ID: {}", user.getId());

        return token;
    }

    private TokenPayLoad generateToken(JWTClaimsSet.Builder claimsBuilder, Date expiredTime) {
        String jwtId = UUID.randomUUID().toString();
        JWTClaimsSet claimsSet = claimsBuilder.jwtID(jwtId).build();

        JWSHeader header = new JWSHeader(SIGNATURE_ALGORITHM);
        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secretKey));
        } catch (JOSEException e) {
            log.error("Failed to sign JWT token", e);
            throw new RuntimeException("Failed to sign JWT token", e);
        }

        String token = jwsObject.serialize();
        return TokenPayLoad.builder()
                .token(token)
                .jwtId(jwtId)
                .expiredTime(expiredTime)
                .build();
    }


    @Override
    public boolean verifyToken(String token) throws ParseException, JOSEException {
        return verifyToken(token, true);
    }

    @Override
    public boolean verifyToken(String token, boolean checkBlacklist) throws ParseException, JOSEException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expirationTime == null || expirationTime.before(new Date())){
                log.debug("Token has expired");
                return false;
            }

            if (checkBlacklist) {
                String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
                if (jwtId == null) {
                    log.warn("Token does not contain JWT ID");
                    throw new IllegalArgumentException("Token must contain a JWT ID");
                }

                if (blacklistedAccessTokenRepository.existsById(jwtId)) {
                    log.debug("Token is blacklisted: {}", jwtId);
                    return false;
                }
            }

            boolean verified = signedJWT.verify(new MACVerifier(secretKey));

            if (!verified) {
                log.debug("Token verification failed");
            }
            return verified;
        } catch (ParseException | JOSEException e) {
            log.error("Error verifying token", e);
            throw e;
        }
    }

    @Override
    public JwtInfo parseToken(String token) throws ParseException {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            String jwtId = claims.getJWTID();
            Date issueTime = claims.getIssueTime();
            Date expiredTime = claims.getExpirationTime();

            return JwtInfo.builder()
                    .jwtId(jwtId)
                    .issueTime(issueTime)
                    .expiredTime(expiredTime)
                    .build();
        } catch (ParseException e) {
            log.error("Failed to parse token", e);
            throw e;
        }
    }
}