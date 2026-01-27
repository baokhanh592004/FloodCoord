package com.team6.floodcoord.service;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.dto.JwtInfo;
import com.team6.floodcoord.dto.TokenPayLoad;
import com.team6.floodcoord.dto.request.LoginRequest;
import com.team6.floodcoord.dto.response.LoginResponse;
import com.team6.floodcoord.model.BlackListedAccessToken;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.ValidRefreshToken;
import com.team6.floodcoord.repository.BlacklistedAccessTokenRepository;
import com.team6.floodcoord.repository.UserRepository;
import com.team6.floodcoord.repository.ValidRefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService{

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final BlacklistedAccessTokenRepository blacklistedAccessTokenRepository;
    private final ValidRefreshTokenRepository validRefreshTokenRepository;

    @Override
    public void logout(String token) throws ParseException {
        log.info("Processing logout request");

        JwtInfo jwtInfo = jwtService.parseToken(token);
        String jwtId = jwtInfo.getJwtId();
        Date expiredTime = jwtInfo.getExpiredTime();

        long ttlSeconds = (expiredTime.getTime() - System.currentTimeMillis()) / 1000;
        if (ttlSeconds <= 0 ){
            log.info("Token already expired, no need to blacklist.");
            return;
        }

        BlackListedAccessToken blacklistedToken = BlackListedAccessToken.builder()
                .jwtId(jwtId)
                .timeToLiveSeconds(ttlSeconds)
                .build();
        blacklistedAccessTokenRepository.save(blacklistedToken);

        log.info("Logout successful - Access token blacklisted with TTL: {} seconds", ttlSeconds);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new BadCredentialsException("Invalid email or password"));

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(authToken);

        user = (User) authentication.getPrincipal();
        log.info("User authenticated successfully: {}", user.getEmail());

        //generate tokens
        TokenPayLoad accessPayload = jwtService.generateAccessToken(user);
        TokenPayLoad refreshPayload = jwtService.generateRefreshToken(user);

        ValidRefreshToken refreshToken = ValidRefreshToken.builder()
                .jwtId(refreshPayload.getJwtId())
                .user(user)
                .expiredTime(LocalDateTime.ofInstant(refreshPayload.getExpiredTime().toInstant(), ZoneId.systemDefault()))
                .revoked(false)
                .build();

        return LoginResponse.builder()
                .accessToken(accessPayload.getToken())
                .refreshToken(refreshPayload.getToken())
                .build();

    }

    @Override
    public LoginResponse refreshToken(String refreshToken) throws ParseException, JOSEException {
        log.info("Processing refresh token request");

        // Verify token signature and expiration
        if (!jwtService.verifyToken(refreshToken, false)) {
            log.warn("Refresh token verification failed");
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        JwtInfo tokenInfo = jwtService.parseToken(refreshToken);

        // Find stored refresh token
        ValidRefreshToken storedToken = validRefreshTokenRepository.findByJwtId(tokenInfo.getJwtId())
                .orElseThrow(() -> {
                    log.warn("Refresh token not found in database: {}", tokenInfo.getJwtId());
                    return new IllegalArgumentException("Refresh token not found or has been revoked");
                });

        //check if token still valid
        if (!storedToken.isValid()){
            log.warn("Refresh token is revoked or expired: {}", tokenInfo.getJwtId());
            throw new IllegalArgumentException("Refresh token is revoked or expired");
        }

        User user = storedToken.getUser();
        log.info("Refreshing tokens for user: {}", user.getEmail());

        // Generate new tokens
        TokenPayLoad newAccessPayload = jwtService.generateAccessToken(user);
        TokenPayLoad newRefreshPayLoad = jwtService.generateRefreshToken(user);

        // Revoke old refresh token (token rotation for better security)
        storedToken.setRevoked(true);
        validRefreshTokenRepository.save(storedToken);

        //save new refresh token
        ValidRefreshToken newRefreshToken = ValidRefreshToken.builder()
                .jwtId(newRefreshPayLoad.getJwtId())
                .user(user)
                .expiredTime(LocalDateTime.ofInstant(
                        newRefreshPayLoad.getExpiredTime().toInstant(),
                        ZoneId.systemDefault()
                ))
                .revoked(false)
                .build();
        validRefreshTokenRepository.save(newRefreshToken);

        log.info("Tokens refreshed successfully for user: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(newAccessPayload.getToken())
                .refreshToken(newRefreshPayLoad.getToken())
                .build();
    }
}
