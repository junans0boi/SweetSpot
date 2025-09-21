package com.hollywood.sweetspot.config.security;

import com.hollywood.sweetspot.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    private SecretKey secretKey;

    // Access Token 유효 시간: 30분
    private static final long ACCESS_TOKEN_VALIDITY_MS = 30 * 60 * 1000L;
    // Refresh Token 유효 시간: 14일
    private static final long REFRESH_TOKEN_VALIDITY_MS = 14 * 24 * 60 * 60 * 1000L;

    @PostConstruct
    protected void init() {
        secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // Access Token 생성
    public String createAccessToken(Authentication authentication) {
        return createToken(authentication, ACCESS_TOKEN_VALIDITY_MS);
    }

    // Refresh Token 생성
    public String createRefreshToken(Authentication authentication) {
        return createToken(authentication, REFRESH_TOKEN_VALIDITY_MS);
    }

    private String createToken(Authentication authentication, long validityMs) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityMs);

        String authorities = authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(authentication.getName())
                .claim("roles", authorities)
                .issuedAt(now)
                .expiration(validity)
                .signWith(secretKey)
                .compact();
    }

    // 토큰에서 인증 정보 조회
    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        List<SimpleGrantedAuthority> authorities = ((List<?>) claims.get("roles", List.class)).stream()
                .map(authority -> new SimpleGrantedAuthority((String) authority))
                .collect(Collectors.toList());

        return new UsernamePasswordAuthenticationToken(claims.getSubject(), null, authorities);
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            // MalformedJwtException, ExpiredJwtException, etc.
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
