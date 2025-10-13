// UserInfoResponse.java

package com.hollywood.sweetspot.user.dto;

import com.hollywood.sweetspot.user.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserInfoResponse {
    private String email;
    private String name;
    private String pictureUrl;

    // User 엔티티를 받아서 DTO로 변환하는 정적 팩토리 메소드
    public static UserInfoResponse from(User user) {
        return new UserInfoResponse(
                user.getEmail(),
                user.getName(),
                user.getPictureUrl()
        );
    }
}