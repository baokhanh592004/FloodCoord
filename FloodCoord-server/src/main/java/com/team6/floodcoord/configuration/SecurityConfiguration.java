package com.team6.floodcoord.configuration;

import com.team6.floodcoord.model.User;
import com.team6.floodcoord.repository.UserRepository;
import com.team6.floodcoord.service.UserDetailServiceCustomizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/register",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api/rescue-requests/**"
    };

    private static final String CORS_MAPPING_PATTERN ="/**";
    private static final String ALLOWED_HEADERS_ALL = "*";
    private static final int BCRYPT_STRENGTH = 12;

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    private final UserDetailServiceCustomizer userDetailServiceCustomizer;
    private final JwtDecoderConfiguration jwtDecoderConfiguration;
    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("Configuring security filter chain");
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwtConfigurer -> jwtConfigurer
                                .decoder(jwtDecoderConfiguration)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())));
        log.info("Security filter chain configured successfully");
        return http.build();
    }

    /**
     * BEAN MỚI: Chuyển đổi từ JWT sang User Entity
     * Giúp @AuthenticationPrincipal User currentUser hoạt động
     */
    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter() {
        return new Converter<Jwt, AbstractAuthenticationToken>() {
            @Override
            public AbstractAuthenticationToken convert(Jwt jwt) {
                // 1. Chuyển đổi Roles (Authorities)
                JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
                grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
                grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
                Collection<GrantedAuthority> authorities = grantedAuthoritiesConverter.convert(jwt);

                // 2. Load User từ Database dựa vào ID trong Token (Subject)
                User userDetails = null;
                try {
                    Long userId = Long.valueOf(jwt.getSubject());
                    userDetails = userRepository.findById(userId).orElse(null);
                } catch (NumberFormatException e) {
                    log.error("Invalid User ID in JWT Subject: {}", jwt.getSubject());
                }

                // 3. Trả về Authentication Token với Principal là User Entity
                return new UsernamePasswordAuthenticationToken(userDetails, jwt, authorities);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        configuration.setAllowedHeaders(List.of(ALLOWED_HEADERS_ALL));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration(CORS_MAPPING_PATTERN, configuration);

        log.info("CORS configuration initialized with allowed origins: {}", Arrays.toString(allowedOrigins));
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailServiceCustomizer);
        authenticationProvider.setPasswordEncoder(passwordEncoder());

        log.info("Authentication manager configured with DAO authentication provider");
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("Password encoder configured with BCrypt strength: {}", BCRYPT_STRENGTH);
        return new BCryptPasswordEncoder(BCRYPT_STRENGTH);
    }
}
