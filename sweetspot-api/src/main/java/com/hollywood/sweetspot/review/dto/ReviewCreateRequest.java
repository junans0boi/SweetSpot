package com.hollywood.sweetspot.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class ReviewCreateRequest {

    @NotNull(message = "장소 ID는 필수입니다.")
    private Long placeId;

    @NotNull(message = "평점은 필수입니다.")
    @Min(1) @Max(5)
    private Integer rating;

    @NotBlank(message = "리뷰 내용은 필수입니다.")
    @Size(max = 500, message = "리뷰는 500자 이내로 작성해주세요.")
    private String text;

    // 이미지 URL 리스트 (프론트엔드에서 이미지를 업로드하고 받은 URL들을 전송)
    private List<String> photoUrls;
    // ✅ [추가] 태그 리스트
    private List<String> tags; 

    @Builder
    public ReviewCreateRequest(Long placeId, Integer rating, String text, List<String> photoUrls, List<String> tags) {
        this.placeId = placeId;
        this.rating = rating;
        this.text = text;
        this.photoUrls = photoUrls;
        this.tags = tags;
    }
}