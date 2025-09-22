package com.hollywood.sweetspot.user;

import com.hollywood.sweetspot.config.security.JwtTokenProvider;
import com.hollywood.sweetspot.user.SignInRequest;
import com.hollywood.sweetspot.user.SignUpRequest;
import com.hollywood.sweetspot.user.TokenResponse;
import com.hollywood.sweetspot.user.Provider;
import com.hollywood.sweetspot.user.Role;
import com.hollywood.sweetspot.user.User;
import com.hollywood.sweetspot.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public User signUp(SignUpRequest request) {
        // 1. 이메일 중복 확인
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 2. 사용자 생성 및 비밀번호 암호화
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // 비밀번호 암호화
                .name(request.getName())
                .provider(Provider.LOCAL) // 이메일 가입자는 LOCAL
                .roles(Collections.singletonList(Role.ROLE_USER))
                .build();

        // 3. DB에 저장
        return userRepository.save(user);
    }

    @Transactional
    public TokenResponse signIn(SignInRequest request) {
        // 1. 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        // 2. 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        // 3. Spring Security용 인증(Authentication) 객체 생성
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .toList();

        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);

        // 4. JWT 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        return new TokenResponse(accessToken, refreshToken);
    }
}
