package com.hollywood.sweetspot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins(
                                "http://localhost:19006",     // Expo 웹 미리보기
                                "http://192.168.35.130:19006", // 실제 기기 접근
                                "http://192.168.35.130",       // 기본 IP 접근
                                "http://localhost:8088",      // [추가] Docker 웹 빌드 접근 허용
                                "http://localhost:5008",      // [추가] Admin Client (Vite) 접근 허용
                                "https://admin.sweetspot.kro.kr"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true);
            }
        };
    }
}