package com.phonestore.backend.config;

import com.phonestore.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> org.springframework.security.config.Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/**", "/api/v1/auth",
                    "/api/v1/products/**", "/api/v1/products",
                    "/api/v1/categories/**", "/api/v1/categories",
                    "/api/v1/brands/**", "/api/v1/brands",
                    "/api/v1/orders/**", "/api/v1/orders",
                    "/api/v1/banners/**", "/api/v1/banners",
                    "/api/v1/articles/**", "/api/v1/articles",
                    "/api/v1/favorites/**", "/api/v1/favorites",
                    "/api/v1/notifications/**", "/api/v1/notifications",
                    "/api/v1/imeis/**", "/api/v1/imeis",
                    "/api/v1/warranty/**", "/api/v1/warranty",
                    "/api/v1/reviews/**", "/api/v1/reviews",
                    "/api/v1/vouchers/**", "/api/v1/vouchers",
                    "/api/v1/installments/**", "/api/v1/installments",
                    "/api/v1/trade-in/**",
                    "/api/v1/users/**", "/api/v1/users",
                    "/api/v1/analytics/**",
                    "/api/v1/settings/**",
                    "/error"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
