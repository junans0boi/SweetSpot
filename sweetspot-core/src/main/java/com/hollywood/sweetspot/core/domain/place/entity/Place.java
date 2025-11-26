package com.hollywood.sweetspot.core.domain.place.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.locationtech.jts.geom.Point;

import java.util.List;

@Entity
@Table(name = "places", indexes = {
    @Index(name = "idx_place_name", columnList = "name"),
    @Index(name = "idx_place_main_category", columnList = "mainCategory")
})
@Getter
@Setter
@NoArgsConstructor
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "place_seq_generator")
    @SequenceGenerator(name = "place_seq_generator", sequenceName = "place_id_seq", allocationSize = 1)
    private Long id; 

    @Column(nullable = false)
    private String name;

    @Column(length = 512)
    private String address;

    @Column(length = 512)
    private String roadAddress;

    @Column(length = 512)
    private String jibunAddress;
    
    @Column(nullable = false)
    private String mainCategory;

    @Column(nullable = false)
    private String subCategory;
    
    @Column
    private String originalType;

    @Column(columnDefinition = "geography(Point, 4326)")
    private Point geom;
    
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "place_tags", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "tag")
    private List<String> tags;

    private double rating; 
    private String image;

    @Column(unique = true)
    private String googlePlaceId;

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
    private String reviewsJson;

    private boolean detailsCached = false; 

    // [Admin용] CSV 적재 시 임시 좌표 필드
    @Column(name = "epsg5174x") 
    private Double epsg5174x;
    
    @Column(name = "epsg5174y")
    private Double epsg5174y;

    // [API용] 프론트엔드 편의 메서드
    public double getLatitude() {
        return (geom != null) ? geom.getY() : 0.0;
    }

    public double getLongitude() {
        return (geom != null) ? geom.getX() : 0.0;
    }
}