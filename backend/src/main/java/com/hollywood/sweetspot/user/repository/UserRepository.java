// UserRepository.java (수정 후)

package com.hollywood.sweetspot.user.repository;

import com.hollywood.sweetspot.user.model.Provider;
import com.hollywood.sweetspot.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndProvider(String email, Provider provider);
    List<User> findByEmail(String email);
}