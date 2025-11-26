package com.hollywood.sweetspot.core.domain.user.service;

import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import com.hollywood.sweetspot.core.global.security.JwtTokenProvider;
import com.hollywood.sweetspot.core.domain.user.dto.SignInRequest;
import com.hollywood.sweetspot.core.domain.user.dto.SignUpRequest;
import com.hollywood.sweetspot.core.domain.user.dto.TokenResponse;
import com.hollywood.sweetspot.core.domain.user.entity.Provider;
import com.hollywood.sweetspot.core.domain.user.entity.Role;
import com.hollywood.sweetspot.core.domain.user.entity.User;
import com.hollywood.sweetspot.core.domain.user.repository.UserRepository;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void signUp(SignUpRequest request) {
        // 🔻 수정: 이메일과 함께 'LOCAL' 제공자로 가입한 계정이 있는지 확인
        if (userRepository.findByEmailAndProvider(request.getEmail(), Provider.LOCAL).isPresent()) {
            throw new IllegalArgumentException("이미 해당 이메일로 가입된 계정이 있습니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .provider(Provider.LOCAL) // 이메일 가입자는 LOCAL
                .roles(Collections.singletonList(Role.ROLE_USER))
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public TokenResponse signIn(SignInRequest request) {
        // 🔻 수정: 이메일과 함께 'LOCAL' 제공자로 가입한 계정만 조회
        User user = userRepository.findByEmailAndProvider(request.getEmail(), Provider.LOCAL)
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일이거나, 소셜 로그인으로 가입한 계정입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("잘못된 비밀번호입니다.");
        }

        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());

        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        return new TokenResponse(accessToken, refreshToken);
    }
}

