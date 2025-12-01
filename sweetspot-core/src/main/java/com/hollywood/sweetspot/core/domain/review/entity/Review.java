package com.hollywood.sweetspot.core.domain.review.entity;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 500)
    private String text;

    // ✅ [추가] 리뷰 태그 (별도 테이블 review_tags에 저장됨)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "review_tags", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    // ✅ [변경] StringListConverter 삭제 -> ReviewImage 엔티티 리스트로 변경
    // cascade = CascadeType.ALL: 리뷰 저장/삭제 시 이미지도 같이 저장/삭제
    // orphanRemoval = true: 리스트에서 제거되면 DB에서도 삭제
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewImage> images = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Review(Place place, Long userId, Integer rating, String text, List<String> tags) { // 생성자에도 추가
        this.place = place;
        this.userId = userId;
        this.rating = rating;
        this.text = text;
        if (tags != null) {
            this.tags = tags;
        }
    }

    // ✅ [추가] 태그 수정 편의 메서드
    public void updateTags(List<String> newTags) {
        this.tags.clear();
        if (newTags != null) {
            this.tags.addAll(newTags);
        }
    }

    // ✅ [추가] 이미지 추가 편의 메서드
    public void addImage(String imageUrl) {
        ReviewImage image = ReviewImage.builder()
                .url(imageUrl)
                .review(this)
                .build();
        this.images.add(image);
    }

    // ✅ [추가] 리뷰 내용 수정 메서드
    public void update(Integer rating, String text) {
        this.rating = rating;
        this.text = text;
    }

    // ✅ [추가] 이미지 전체 교체 (수정 시 사용)
    public void updateImages(List<String> newImageUrls) {
        this.images.clear(); // 기존 이미지 삭제 (orphanRemoval로 인해 DB에서도 삭제됨)
        if (newImageUrls != null) {
            for (String url : newImageUrls) {
                this.addImage(url);
            }
        }
    }
}