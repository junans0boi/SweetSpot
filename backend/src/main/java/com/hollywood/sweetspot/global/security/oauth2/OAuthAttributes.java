package com.hollywood.sweetspot.global.security.oauth2;

import com.hollywood.sweetspot.user.model.Provider;
import com.hollywood.sweetspot.user.model.Role;
import com.hollywood.sweetspot.user.model.User;
import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.Map;

@Getter
public class OAuthAttributes {
    private Map<String, Object> attributes;
    private String nameAttributeKey;
    private String name;
    private String email;
    private String picture;
    private Provider provider;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email, String picture, Provider provider) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.provider = provider;
    }

    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return ofGoogle(userNameAttributeName, attributes);
        }
        // 다른 소셜 로그인(네이버, 카카오 등) 추가 시 여기에 분기 처리
        throw new IllegalArgumentException("지원하지 않는 소셜 로그인입니다.");
    }

    private static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .picture((String) attributes.get("picture"))
                .provider(Provider.GOOGLE)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    public User toEntity() {
        return User.builder()
                .name(name)
                .email(email)
                .pictureUrl(picture)
                .provider(provider)
                .roles(Collections.singletonList(Role.ROLE_USER))
                .build();
    }
}
