package com.hollywood.sweetspot.core.domain.review.repository;

import com.hollywood.sweetspot.core.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 특정 장소의 리뷰를 최신순으로 조회 (페이징 처리는 Service/Controller에서 고려)
    List<Review> findByPlaceIdOrderByCreatedAtDesc(Long placeId);
    
    // 사용자가 특정 장소에 이미 리뷰를 작성했는지 확인
    boolean existsByPlaceIdAndUserId(Long placeId, Long userId);
}