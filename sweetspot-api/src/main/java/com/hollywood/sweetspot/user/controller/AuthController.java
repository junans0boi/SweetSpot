package com.hollywood.sweetspot.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.hollywood.sweetspot.core.domain.user.dto.SignInRequest;
import com.hollywood.sweetspot.core.domain.user.dto.SignUpRequest;
import com.hollywood.sweetspot.core.domain.user.dto.TokenResponse;
import com.hollywood.sweetspot.core.domain.user.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@Valid @RequestBody SignUpRequest signUpRequest) {
        authService.signUp(signUpRequest);
        return ResponseEntity.ok("회원가입이 성공적으로 완료되었습니다.");
    }

    @PostMapping("/signin")
    public ResponseEntity<TokenResponse> signIn(@Valid @RequestBody SignInRequest signInRequest) {
        TokenResponse tokenResponse = authService.signIn(signInRequest);
        return ResponseEntity.ok(tokenResponse);
    }
}
