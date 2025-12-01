package com.hollywood.sweetspot.core.domain.user.service;

import java.util.Collections;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import com.hollywood.sweetspot.core.domain.user.entity.User;
import com.hollywood.sweetspot.core.domain.user.repository.UserRepository;
import com.hollywood.sweetspot.core.global.security.oauth2.CustomOAuth2User;
import com.hollywood.sweetspot.core.global.security.oauth2.OAuthAttributes;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;


@Slf4j // 🔻 디버깅을 위한 로그 추가
@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        // 🔻 수정: saveOrUpdate 메소드의 로직을 loadUser 메소드 안으로 직접 가져옵니다. 🔻
        User user = userRepository.findByEmailAndProvider(attributes.getEmail(), attributes.getProvider())
                .map(entity -> {
                    log.info("기존 소셜 사용자 정보 업데이트: {}", entity.getEmail());
                    return entity.update(attributes.getName(), attributes.getPicture());
                })
                .orElseGet(() -> {
                    log.info("새로운 소셜 사용자 등록: {}", attributes.getEmail());
                    return attributes.toEntity();
                });

        // 🔻 save 호출을 트랜잭션이 적용되는 public 메소드 내에서 명시적으로 실행합니다.
        userRepository.save(user);
        userRepository.flush(); // 🧪 디버깅용: 즉시 flush로 SQL 실행 유도
        log.info("OAuth user persisted: id={}, email={}, provider={}", user.getId(), user.getEmail(), user.getProvider());

        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRoles().get(0).name())),
                attributes.getAttributes(),
                attributes.getNameAttributeKey(),
                user.getEmail(),
                user.getRoles().get(0)
        );
    }
}

