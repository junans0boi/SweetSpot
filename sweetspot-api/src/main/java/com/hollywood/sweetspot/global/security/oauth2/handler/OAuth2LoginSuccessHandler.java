// OAuth2LoginSuccessHandler.java (수정 후)

package com.hollywood.sweetspot.global.security.oauth2.handler;

import java.io.IOException;
import java.util.Optional;
import com.hollywood.sweetspot.global.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import static com.hollywood.sweetspot.global.security.oauth2.handler.HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // ✅ [디버깅 로그 1] 요청에 담겨있는 쿠키가 있는지 확인합니다.
        Optional<Cookie> redirectUriCookie = CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME);
        if (redirectUriCookie.isPresent()) {
            log.info("✅ [로그 1] redirect_uri 쿠키를 찾았습니다: " + redirectUriCookie.get().getValue());
        } else {
            log.warn("🚨 [로그 1] redirect_uri 쿠키를 찾을 수 없습니다!");
        }

        Optional<String> redirectUri = redirectUriCookie.map(Cookie::getValue);

        // ✅ [디버깅 로그 2] 쿠키에서 꺼낸 최종 redirectUri 값을 확인합니다.
        String targetUrl = redirectUri.orElse(getDefaultTargetUrl());
        if (targetUrl == null) {
            log.warn("🚨 [로그 2] 쿠키에도, 기본값에도 URL이 없어 fallback URL을 사용합니다.");
            targetUrl = "http://localhost:8088"; // 임시 fallback
        }
        log.info("✅ [로그 2] 토큰을 추가하기 전 Target URL: " + targetUrl);


        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        String finalUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        // ✅ [디버깅 로그 3] 모든 토큰을 붙인 최종 URL을 확인합니다.
        log.info("✅ [로그 3] 앱으로 리디렉션할 최종 URL: " + finalUrl);

        return finalUrl;
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }
}