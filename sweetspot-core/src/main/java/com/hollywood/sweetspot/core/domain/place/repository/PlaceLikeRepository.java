package com.hollywood.sweetspot.core.domain.place.repository;

import com.hollywood.sweetspot.core.domain.place.entity.PlaceLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceLikeRepository extends JpaRepository<PlaceLike, Long> {
    Optional<PlaceLike> findByPlaceIdAndUserId(Long placeId, Long userId);
    List<PlaceLike> findByUserId(Long userId);
    boolean existsByPlaceIdAndUserId(Long placeId, Long userId);
}