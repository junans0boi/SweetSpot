package com.hollywood.sweetspot.domain.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<String> getMyInfo(@AuthenticationPrincipal String userEmail) {
        // @AuthenticationPrincipal 어노테이션을 사용하면,
        // JWT 필터가 SecurityContext에 저장한 사용자 정보(여기서는 이메일)를 바로 주입받을 수 있습니다.

        // 🔻 수정: 응답 문자열 끝에 줄바꿈(\n)을 추가하여 터미널 출력을 깔끔하게 만듭니다.
        return ResponseEntity.ok("인증 성공! 당신의 이메일은: " + userEmail + "\n");
    }
}

