package com.hollywood.sweetspot.core.domain.review.repository;

import com.hollywood.sweetspot.core.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // 추가
import org.springframework.data.repository.query.Param; // 추가
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByPlaceId(Long placeId, Pageable pageable);

    boolean existsByPlaceIdAndUserId(Long placeId, Long userId);

    // ✅ [추가] 특정 장소의 평균 별점 구하기
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.place.id = :placeId")
    Double getAverageRatingByPlaceId(@Param("placeId") Long placeId);

    // ✅ [추가] 특정 장소의 리뷰 태그 중 가장 많이 등장한 Top 5 조회
    // Native Query를 사용하여 그룹핑 및 카운팅
    @Query(value = """
                SELECT t.tag
                FROM review_tags t
                JOIN reviews r ON t.review_id = r.id
                WHERE r.place_id = :placeId
                GROUP BY t.tag
                ORDER BY COUNT(t.tag) DESC
                LIMIT 5
            """, nativeQuery = true)
    List<String> findTopTagsByPlaceId(@Param("placeId") Long placeId);
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}