package com.hollywood.sweetspot.place.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 텍스트 리뷰와 해당 작성자가 올린 사진 목록을 함께 담는 DTO
 */
@Getter
@Builder
public class ReviewWithPhotosDto {
    private String authorName;
    private String text;
    private double rating;
    private List<String> photoUrls; // 작성자의 사진 목록
}
