// UserService.java (수정 후)

package com.hollywood.sweetspot.core.domain.user.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.hollywood.sweetspot.core.domain.user.entity.User;
import com.hollywood.sweetspot.core.domain.user.entity.Provider;
import com.hollywood.sweetspot.core.domain.user.dto.UserInfoResponse;
import com.hollywood.sweetspot.core.domain.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserInfoResponse getUserInfo(String email) {
        // 이메일로 모든 사용자를 리스트로 조회합니다.
        List<User> users = userRepository.findByEmail(email);

        // 조회된 사용자가 없으면 에러를 발생시킵니다.
        if (users.isEmpty()) {
            throw new IllegalArgumentException("해당 유저를 찾을 수 없습니다: " + email);
        }

        // ✅ 조회된 사용자가 여러 명일 경우 LOCAL 계정을 우선으로 선택하고,
        // ✅ LOCAL 계정이 없으면 첫 번째 계정(예: GOOGLE)을 선택합니다.
        User user = users.stream()
                .filter(u -> u.getProvider() == Provider.LOCAL)
                .findFirst()
                .orElse(users.get(0));

        return UserInfoResponse.from(user);
    }



    // ✅ [추가] 프로필 수정 로직
    @Transactional
    public UserInfoResponse updateProfile(String email, String newName, String newPictureUrl) {
        // LOCAL 계정 우선 검색, 없으면 첫 번째 계정
        User user = userRepository.findByEmailAndProvider(email, Provider.LOCAL)
                .orElseGet(() -> userRepository.findByEmail(email).stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("사용자 없음")));

        // 정보 업데이트
        user.updateProfile(newName, newPictureUrl);

        return UserInfoResponse.from(user);
    }
}