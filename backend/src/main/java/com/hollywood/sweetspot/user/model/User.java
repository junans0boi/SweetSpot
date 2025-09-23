package com.hollywood.sweetspot.user.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "users") // 'user'는 DB 예약어인 경우가 많아 'users' 사용을 권장합니다.
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(nullable = false)
    private String name;

    @Column
    private String pictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private List<Role> roles = new ArrayList<>();

    @Builder
    public User(String email, String password, String name, String pictureUrl, Provider provider, List<Role> roles) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.pictureUrl = pictureUrl;
        this.provider = provider;
        this.roles = roles;
    }
}
