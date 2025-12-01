package com.hollywood.sweetspot.core.domain.user.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "user_email_provider_unique", columnNames = { "email", "provider" })
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column
    private String password;

    @Column(nullable = false)
    private String name;

    // ✅ [확인] DB 컬럼명(snake_case)과 매핑 명시
    @Column(name = "picture_url")
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    // ❌ @OnDelete(action = OnDeleteAction.CASCADE) <-- 삭제하세요!
    // @ElementCollection은 기본적으로 부모 엔티티 삭제 시 함께 삭제됩니다.
    private List<Role> roles;

    @Builder
    public User(String email, String password, String name, String pictureUrl, Provider provider, List<Role> roles) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.pictureUrl = pictureUrl;
        this.provider = provider;
        this.roles = roles;
    }

    // ✅ [추가] 프로필 수정 편의 메서드
    public void updateProfile(String name, String pictureUrl) {
        if (name != null && !name.isEmpty()) {
            this.name = name;
        }
        if (pictureUrl != null && !pictureUrl.isEmpty()) {
            this.pictureUrl = pictureUrl;
        }
    }

    // (기존 oauth용 update 메서드가 있다면 그것과 별개로 두거나 통합해도 됨)
    public User update(String name, String pictureUrl) {
        this.name = name;
        this.pictureUrl = pictureUrl;
        return this;
    }

    public void updateRoles(List<Role> newRoles) {
        this.roles.clear();
        this.roles.addAll(newRoles);
        // 또는 this.roles = new ArrayList<>(newRoles);
    }
}