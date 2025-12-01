package com.hollywood.sweetspot.core.domain.user.repository;

import com.hollywood.sweetspot.core.domain.user.entity.Provider; 
import com.hollywood.sweetspot.core.domain.user.entity.User;   
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndProvider(String email, Provider provider);
    List<User> findByEmail(String email);
}