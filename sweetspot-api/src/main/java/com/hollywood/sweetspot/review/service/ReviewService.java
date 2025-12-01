package com.hollywood.sweetspot.review.service;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import com.hollywood.sweetspot.core.domain.review.entity.Review;
import com.hollywood.sweetspot.core.domain.review.repository.ReviewRepository;
import com.hollywood.sweetspot.core.domain.user.entity.User;
import com.hollywood.sweetspot.core.domain.user.repository.UserRepository;
import com.hollywood.sweetspot.review.dto.ReviewCreateRequest;
import com.hollywood.sweetspot.review.dto.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    /**
     * 내부 메서드: 장소 평점 업데이트 (재사용을 위해 분리)
     */
    @Transactional
    private void updatePlaceRating(Long placeId) {
        Double averageRating = reviewRepository.getAverageRatingByPlaceId(placeId);
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없습니다."));

        place.updateRating(averageRating); // Place 엔티티의 rating 필드 업데이트
        // Transactional 안이므로 save 호출 안 해도 Dirty Checking으로 업데이트 됨
    }

    /**
     * ✅ 내부 메서드: 장소 태그 통계 업데이트 (Top 5 추출하여 Place에 저장)
     */
    @Transactional
    private void updatePlaceTags(Long placeId) {
        List<String> topTags = reviewRepository.findTopTagsByPlaceId(placeId);
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없습니다."));

        place.updateTopTags(topTags); // Place 엔티티 업데이트
    }

    /**
     * 리뷰 생성
     */
    @Transactional
    public ReviewResponse createReview(String userEmail, ReviewCreateRequest request) { // 1. 작성자 조회 (Auth DB)
        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 장소 조회 (Domain DB)
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없습니다."));

        // 3. 중복 체크
        if (reviewRepository.existsByPlaceIdAndUserId(place.getId(), user.getId())) {
            throw new IllegalArgumentException("이미 이 장소에 리뷰를 작성하셨습니다.");
        }

        // 4. 리뷰 객체 생성 (이미지 제외하고 빌드)
        Review review = Review.builder()
                .userId(user.getId())
                .place(place)
                .rating(request.getRating())
                .text(request.getText())
                .tags(request.getTags())
                .build();

        // ✅ [수정] 이미지 별도 추가 (ReviewImage 엔티티 생성)
        if (request.getPhotoUrls() != null) {
            for (String url : request.getPhotoUrls()) {
                review.addImage(url);
            }
        }

        Review savedReview = reviewRepository.save(review); // cascade로 인해 이미지도 같이 저장됨
        // ✅ 평점 & 태그 업데이트
        updatePlaceRating(place.getId()); // (이전에 만든 평점 업데이트)
        updatePlaceTags(place.getId()); // [추가] 태그 업데이트

        return ReviewResponse.from(savedReview, user, userEmail);
    }

    /**
     * 특정 장소의 리뷰 목록 조회
     */
    public Page<ReviewResponse> getReviewsByPlace(Long placeId, String currentUserEmail, Pageable pageable) {
        // DB에서 페이지 단위로 조회
        Page<Review> reviewPage = reviewRepository.findByPlaceId(placeId, pageable);

        // Page.map()을 사용하여 DTO로 변환
        return reviewPage.map(review -> {
            User author = userRepository.findById(review.getUserId())
                    .orElse(User.builder().name("알 수 없음").email("").build());
            return ReviewResponse.from(review, author, currentUserEmail);
        });
    }

    /**
     * ✅ [추가] 내가 쓴 리뷰 목록
     */
    public Page<ReviewResponse> getMyReviews(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(review -> ReviewResponse.from(review, user, userEmail));
    }
    
    /**
     * 리뷰 수정
     */
    @Transactional
    public ReviewResponse updateReview(Long reviewId, String userEmail, ReviewCreateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보 없음"));

        // 본인 확인
        if (!review.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        // 내용 및 평점 수정
        review.update(request.getRating(), request.getText());
        review.updateImages(request.getPhotoUrls());
        review.updateTags(request.getTags()); // ✅ 태그 수정

        // ✅ 평점 & 태그 업데이트
        updatePlaceRating(review.getPlace().getId());
        updatePlaceTags(review.getPlace().getId()); // [추가]
        return ReviewResponse.from(review, user, userEmail);
    }

    // ... (deleteReview도 비슷하게 수정: review.getUserId()와 비교)
    @Transactional
    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        Long placeId = review.getPlace().getId(); // 삭제 전 장소 ID 저장
        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보 없음"));

        if (!review.getUserId().equals(user.getId())) { // 🚨 [수정] ID 비교
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        reviewRepository.delete(review);
        reviewRepository.flush(); // 즉시 반영

        // ✅ 평점 & 태그 업데이트
        updatePlaceRating(placeId);
        updatePlaceTags(placeId); // [추가]
    }
}