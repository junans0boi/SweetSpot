package com.hollywood.sweetspot.review.dto;

import com.hollywood.sweetspot.core.domain.review.entity.Review;
import com.hollywood.sweetspot.core.domain.user.entity.User; // User 필요
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class ReviewResponse {
    private Long id;
    private Long placeId;
    private String authorName;
    private String authorEmail;
    private Integer rating;
    private String text;
    private List<String> photoUrls;
    private LocalDateTime createdAt;
    private boolean isOwner;

    // 🚨 [수정] User 객체를 파라미터로 추가로 받습니다.
    public static ReviewResponse from(Review review, User author, String currentLoginEmail) {
        boolean isOwner = author.getEmail().equals(currentLoginEmail);
        
        return ReviewResponse.builder()
                .id(review.getId())
                .placeId(review.getPlace().getId())
                .authorName(author.getName())   // User 객체에서 가져옴
                .authorEmail(author.getEmail()) // User 객체에서 가져옴
                .rating(review.getRating())
                .text(review.getText())
                .photoUrls(review.getPhotoUrls())
                .createdAt(review.getCreatedAt())
                .isOwner(isOwner)
                .build();
    }
}