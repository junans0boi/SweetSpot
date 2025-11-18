package com.hollywood.sweetspot.place.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Entity
@Table(name = "places")
@Getter
@Setter
@NoArgsConstructor
public class Place {

    @Id
    private Long id; // places.json의 ID를 그대로 사용 (auto-increment 아님)

    @Column(nullable = false)
    private String name;

    @Column(length = 512)
    private String address;

    @Column(nullable = false)
    private String mainCategory;

    @Column(nullable = false)
    private String subCategory;
    
    // ✅ [추가] places.json의 originalType 필드 (카테고리 분석용)
    private String originalType;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "place_tags", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "tag")
    private List<String> tags;

    private double rating; // Google/자체 평점
    private String image; // picsum.photos 이미지 URL

    @Embedded
    private Coordinate coordinate;

    // --- Google API 캐시용 필드 ---

    @Column(unique = true)
    private String googlePlaceId; // Google Places API의 place_id

    @Column(length = 1024)
    private String website;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "place_photos", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "photo_url", length = 1024)
    private List<String> photoUrls;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "place_opening_hours", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "opening_hour_text", length = 255)
    private List<String> openingHours;

    @Column(columnDefinition = "TEXT")
    private String reviewsJson; // Google 리뷰 JSON 문자열 (또는 별도 테이블)

    private boolean detailsCached = false; // 캐시 여부 플래그

    // ✅ [신규] Service 레이어에서 Coordinate 객체에 직접 접근하지 않고
    // Place 엔티티를 통해 좌표 값을 가져올 수 있도록 헬퍼 메소드 추가
    public double getLatitude() {
        return coordinate != null ? coordinate.getLatitude() : 0.0;
    }

    public double getLongitude() {
        return coordinate != null ? coordinate.getLongitude() : 0.0;
    }
}

@Embeddable
@Getter
@Setter
@NoArgsConstructor
// ✅ [수정] 'public' 키워드가 없는 package-private 클래스 (정상)
class Coordinate {
    private double latitude;
    private double longitude;
}

