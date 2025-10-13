package com.hollywood.sweetspot.user.controller; // 패키지 경로를 user로 변경

import com.hollywood.sweetspot.user.dto.UserInfoResponse;
import com.hollywood.sweetspot.user.service.UserService;
import lombok.RequiredArgsConstructor; // ✅ 추가
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor // ✅ 추가
public class UserController {

    private final UserService userService; // ✅ UserService 주입

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getMyInfo(@AuthenticationPrincipal String userEmail) {
        // @AuthenticationPrincipal 어노테이션을 통해 JWT 토큰의 소유자 이메일을 가져옵니다.
        // 이 이메일을 사용하여 UserService에서 사용자 정보를 조회합니다.
        UserInfoResponse userInfo = userService.getUserInfo(userEmail);
        return ResponseEntity.ok(userInfo);
    }
}
