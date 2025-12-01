package com.hollywood.sweetspot.user.controller;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import com.hollywood.sweetspot.core.domain.user.dto.UserInfoResponse;
import com.hollywood.sweetspot.core.domain.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ✅ DTO 정의 (중복 제거됨 - 하나만 남김)
    @Getter
    @NoArgsConstructor
    public static class UpdateProfileRequest {
        private String name;
        private String pictureUrl;
    }

    // 내 정보 조회 (GET)
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getMyInfo(@AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(userService.getUserInfo(userEmail));
    }

    // 프로필 수정 (PUT)
    @PutMapping("/me")
    public ResponseEntity<UserInfoResponse> updateProfile(
            @AuthenticationPrincipal String userEmail,
            @RequestBody UpdateProfileRequest request) {
        UserInfoResponse response = userService.updateProfile(userEmail, request.getName(), request.getPictureUrl());
        return ResponseEntity.ok(response);
    }
}