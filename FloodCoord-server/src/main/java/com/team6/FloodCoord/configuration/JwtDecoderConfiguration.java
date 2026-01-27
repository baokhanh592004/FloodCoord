package com.team6.floodcoord.configuration;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.service.JwtServiceImpl;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtDecoderConfiguration implements JwtDecoder {

    private static final String JWT_ALGORITHM = "HS512";
    private static final int MINIMUM_KEY_LENGTH_BYTES = 64;

    @Value("${jwt.secret-key}")
    private String secretKey;

    private final JwtServiceImpl jwtServiceImpl;
    private NimbusJwtDecoder nimbusJwtDecoder;

    @PostConstruct
    public void init() {
        validateSecretKey();

        try {
            SecretKey key = new SecretKeySpec(
                    secretKey.getBytes(StandardCharsets.UTF_8),
                    JWT_ALGORITHM
            );

            this.nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(key)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();

            log.info("Jwt decoder successfully initialized with {} algorithm",JWT_ALGORITHM);
        } catch (Exception e){
            log.error("Failed to initialized JWT decoder", e);
            throw new IllegalStateException("Failed to initialized JWT decoder");
        }
    }

    private void validateSecretKey(){
        if (secretKey == null || secretKey.isBlank()){
            throw new IllegalStateException("JWT secret key is not configured");
        }

        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MINIMUM_KEY_LENGTH_BYTES){
            throw new IllegalStateException(
                    String.format("JWT secret key must be at least %d bytes for %s algorithm. Current length: %d bytes,",
                            MINIMUM_KEY_LENGTH_BYTES,JWT_ALGORITHM,keyBytes.length)
            );
        }
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            if (!jwtServiceImpl.verifyToken(token))  {
                log.warn("Token verification failed");
                throw new JwtException("Invalid or expired jwt token");
            }

            return nimbusJwtDecoder.decode(token);
        } catch (ParseException e){
            log.error("Failed to parse JWT token", e);
            throw new JwtException("Failed to parse JWT token", e);
        } catch (JOSEException e){
            log.error("JOSE processing error while verifying token", e);
            throw new JwtException("Failed to verify JWT token signature", e);
        } catch (JwtException e){
            throw e;
        } catch (Exception e){
            log.error("Unexpected error during JWT token decoding", e);
            throw new JwtException("Unexpected error during JWT token decoding", e);
        }
    }
}
