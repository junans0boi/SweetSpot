package com.hollywood.sweetspot.user.repository;

import com.hollywood.sweetspot.user.model.Provider;
import com.hollywood.sweetspot.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 🔻 email과 provider를 함께 사용하여 유저를 찾는 메소드 추가
    Optional<User> findByEmailAndProvider(String email, Provider provider);
}

