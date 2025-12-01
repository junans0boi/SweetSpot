package com.hollywood.sweetspot.review.controller;

import com.hollywood.sweetspot.review.dto.ReviewCreateRequest;
import com.hollywood.sweetspot.review.dto.ReviewResponse;
import com.hollywood.sweetspot.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 작성
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody ReviewCreateRequest request) {
        ReviewResponse response = reviewService.createReview(userEmail, request);
        return ResponseEntity.ok(response);
    }

    // 특정 장소의 리뷰 조회 (로그인 안 한 유저도 볼 수 있게 하려면 userEmail null 처리 필요)
    @GetMapping("/place/{placeId}")
    public ResponseEntity<Page<ReviewResponse>> getPlaceReviews(
            @PathVariable Long placeId,
            @AuthenticationPrincipal String userEmail,
            // 기본값: 첫 페이지(0), 10개씩, 최신순(createdAt DESC)
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        String email = (userEmail != null) ? userEmail : "";
        return ResponseEntity.ok(reviewService.getReviewsByPlace(placeId, email, pageable));
    }

    // ✅ [추가] 리뷰 수정
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal String userEmail,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, userEmail, request));
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal String userEmail,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId, userEmail);
        return ResponseEntity.noContent().build();
    }

    // 내 리뷰 조회 API
    @GetMapping("/me")
    public ResponseEntity<Page<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal String userEmail,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getMyReviews(userEmail, pageable));
    }
}