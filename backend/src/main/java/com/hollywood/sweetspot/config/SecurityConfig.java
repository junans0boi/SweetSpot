package com.hollywood.sweetspot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 보호 비활성화
                .csrf(AbstractHttpConfigurer::disable)

                // 세션 관리 정책: STATELESS (JWT 사용을 위함)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // HTTP 요청 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 🔻 수정된 부분: AntPathRequestMatcher를 사용하여 명시적으로 경로 지정
                        .requestMatchers(new AntPathRequestMatcher("/api/**")).permitAll()
                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated());

        return http.build();
    }
}
