package com.hollywood.sweetspot.core.domain.review.entity;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
// import com.hollywood.sweetspot.core.domain.user.entity.User; // ❌ 삭제
import com.hollywood.sweetspot.core.global.converter.StringListConverter;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
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

    @ManyToOne
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    // 🚨 [수정] User 객체 연관관계 삭제 -> 단순히 user_id(Long) 값만 저장
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "photo_urls", columnDefinition = "text")
    @Convert(converter = StringListConverter.class)
    private List<String> photoUrls;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Review(Place place, Long userId, Integer rating, String text, List<String> photoUrls) { // User -> Long userId 변경
        this.place = place;
        this.userId = userId;
        this.rating = rating;
        this.text = text;
        this.photoUrls = photoUrls;
    }
}