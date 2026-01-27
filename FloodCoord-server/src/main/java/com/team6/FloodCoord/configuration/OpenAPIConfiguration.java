package com.team6.floodcoord.configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class OpenAPIConfiguration {
    private static final String SECURITY_SCHEME_NAME = "bearerAuth";
    private static final String JWT_BEARER_FORMAT = "JWT";
    private static final String AUTHORIZATION_HEADER = "Authorization";

    @Bean
    public OpenAPI openAPI(@Value("${open.api.title}") String title,
                           @Value("${open.api.version}") String version,
                           @Value("${open.api.description}") String description){
        log.info("Configuring OpenAPI documentation - Title {}, Version {}", title, version);

        return new OpenAPI()
                .info(createApiInfo(title, version, description))
                .components(createSecurityComponents())
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));

    }

    /**
     * Create API information metadata
     */
    private Info createApiInfo(String title, String version, String description){
        return new Info()
                .title(title)
                .version(version)
                .description(description);
    }

    /**
     * Create security components with JWT Bearer authentication
     */
    private Components createSecurityComponents(){
        return new Components()
                .addSecuritySchemes(SECURITY_SCHEME_NAME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat(JWT_BEARER_FORMAT)
                                .in(SecurityScheme.In.HEADER)
                                .name(AUTHORIZATION_HEADER));
    }

}
