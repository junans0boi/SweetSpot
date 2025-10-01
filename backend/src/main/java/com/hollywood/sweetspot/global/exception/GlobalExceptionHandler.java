package com.hollywood.sweetspot.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * AuthService에서 발생하는 이메일 중복 등 비즈니스 로직 관련 예외를 처리합니다.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException e) {
        // 클라이언트에게는 400 Bad Request 상태 코드와 에러 메시지를 JSON 형태로 반환합니다.
        Map<String, String> response = Map.of("message", e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * CustomOAuth2UserService에서 발생하는 소셜 로그인 관련 예외를 처리합니다.
     * (예: 이미 이메일로 가입된 계정으로 소셜 로그인을 시도할 경우)
     */
    @ExceptionHandler(OAuth2AuthenticationException.class)
    public ResponseEntity<Object> handleOAuth2AuthenticationException(OAuth2AuthenticationException e) {
        Map<String, String> response = Map.of("message", e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}