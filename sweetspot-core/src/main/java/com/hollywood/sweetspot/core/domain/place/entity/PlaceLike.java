package com.hollywood.sweetspot.core.domain.place.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "place_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"place_id", "user_id"}) // 중복 찜 방지
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlaceLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id", nullable = false)
    private Place place;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Builder
    public PlaceLike(Place place, Long userId) {
        this.place = place;
        this.userId = userId;
    }
}