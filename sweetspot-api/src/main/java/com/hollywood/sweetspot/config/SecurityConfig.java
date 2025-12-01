package com.hollywood.sweetspot.config;

import lombok.RequiredArgsConstructor;
import com.hollywood.sweetspot.core.domain.user.service.CustomOAuth2UserService;
import com.hollywood.sweetspot.core.global.security.JwtAuthenticationFilter;
import com.hollywood.sweetspot.core.global.security.oauth2.handler.OAuth2LoginFailureHandler;
import com.hollywood.sweetspot.core.global.security.oauth2.handler.OAuth2LoginSuccessHandler;
import com.hollywood.sweetspot.core.global.security.oauth2.handler.HttpCookieOAuth2AuthorizationRequestRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ 1. CORS 설정 연결
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    new AntPathRequestMatcher("/api/auth/**"),
                    new AntPathRequestMatcher("/api/test"),
                    new AntPathRequestMatcher("/api/places/**"), // 장소 조회/검색
                    new AntPathRequestMatcher("/oauth2/**"),
                    new AntPathRequestMatcher("/login/oauth2/**"),
                    new AntPathRequestMatcher("/api/reviews/place/**", "GET"), // 리뷰 조회 (GET만 허용)
                    new AntPathRequestMatcher("/error"),
                    new AntPathRequestMatcher("/api/sweet-pick/**"), // AI 추천
                    
                    // ✅ 2. 이미지 보안 강화: 보기는 허용하되, 업로드는 인증 필요
                    new AntPathRequestMatcher("/api/images/view/**", "GET") 
                )
                .permitAll()
                .anyRequest().authenticated()) // 나머지는(리뷰 작성, 이미지 업로드 등) 인증 필요
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(a -> a.authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository))
                .successHandler(oAuth2LoginSuccessHandler)
                .failureHandler(oAuth2LoginFailureHandler)
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService)));
        return http.build();
    }

    // ✅ 1. CORS 설정 빈 (Bean) 추가
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 모든 출처 허용 (보안 강화 시 프론트엔드 도메인만 지정 가능)
        configuration.setAllowedOriginPatterns(List.of("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // 쿠키/인증정보 포함 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}