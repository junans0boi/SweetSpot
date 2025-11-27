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
     * 리뷰 생성
     */
    @Transactional
    public ReviewResponse createReview(String userEmail, ReviewCreateRequest request) {
        // 1. 작성자 조회 (Auth DB)
        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 장소 조회 (Domain DB)
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없습니다."));

        // 3. 중복 체크
        if (reviewRepository.existsByPlaceIdAndUserId(place.getId(), user.getId())) {
            throw new IllegalArgumentException("이미 이 장소에 리뷰를 작성하셨습니다.");
        }

        // 4. 리뷰 저장 (User 객체 대신 userId 저장)
        Review review = Review.builder()
                .userId(user.getId()) // 🚨 [수정]
                .place(place)
                .rating(request.getRating())
                .text(request.getText())
                .photoUrls(request.getPhotoUrls())
                .build();

        Review savedReview = reviewRepository.save(review);

        // 5. 응답 생성
        return ReviewResponse.from(savedReview, user, userEmail); // 🚨 [수정] user 객체 전달
    }

    /**
     * 특정 장소의 리뷰 목록 조회
     */
    public List<ReviewResponse> getReviewsByPlace(Long placeId, String currentUserEmail) {
        List<Review> reviews = reviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId);

        // N+1 문제 방지 및 User 정보 조회:
        // 리뷰에 저장된 모든 userId 수집 -> UserRepository에서 한 번에 조회 -> Map으로 매핑
        // (간단하게는 반복문 안에서 조회해도 되지만, 성능상 IN 쿼리가 좋습니다.)

        // 여기서는 간단하게 구현 (추후 최적화 가능)
        return reviews.stream()
                .map(review -> {
                    // 작성자 정보 조회 (Auth DB)
                    User author = userRepository.findById(review.getUserId())
                            .orElse(User.builder().name("알 수 없음").email("").build()); // 탈퇴한 유저 처리 등

                    return ReviewResponse.from(review, author, currentUserEmail);
                })
                .collect(Collectors.toList());
    }

    // ... (deleteReview도 비슷하게 수정: review.getUserId()와 비교)
    @Transactional
    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자 정보 없음"));

        if (!review.getUserId().equals(user.getId())) { // 🚨 [수정] ID 비교
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        reviewRepository.delete(review);
    }
}