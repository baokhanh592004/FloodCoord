package com.team6.floodcoord.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(
        basePackages = "com.team6.floodcoord.repository.jpa"
)
public class JpaConfig {
}