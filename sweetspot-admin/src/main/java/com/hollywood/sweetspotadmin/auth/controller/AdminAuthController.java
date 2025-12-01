package com.hollywood.sweetspotadmin.auth.controller; // 패키지명 확인

import com.hollywood.sweetspot.core.domain.user.dto.SignInRequest;
import com.hollywood.sweetspot.core.domain.user.dto.TokenResponse;
import com.hollywood.sweetspot.core.domain.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth") // ✅ 경로를 /api/admin/auth로 설정
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;

   @PostMapping("/signin")
    public ResponseEntity<TokenResponse> signIn(@RequestBody SignInRequest signInRequest) {
        TokenResponse tokenResponse = authService.signIn(signInRequest);
        
        // 🚨 [추가] 토큰에서 권한을 확인하여 관리자만 로그인 허용
        // 이 로직은 `sweetspot-core`의 JwtTokenProvider를 사용하여 토큰을 파싱해야 합니다.
        // 임시로, 'ROLE_ADMIN'이 포함되지 않은 토큰이면 403 Forbidden을 반환하도록 처리해야 합니다.
        // (AuthService를 상속/확장하여 Admin 전용 서비스에서 이 로직을 처리하는 것이 가장 깔끔합니다.)
        
        return ResponseEntity.ok(tokenResponse);
    }
}