package com.hollywood.sweetspot.place.service;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.entity.PlaceLike;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceLikeRepository;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import com.hollywood.sweetspot.core.domain.user.entity.User;
import com.hollywood.sweetspot.core.domain.user.repository.UserRepository;
import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final PlaceLikeRepository placeLikeRepository;
    private final UserRepository userRepository;

    // ✅ 찜 토글 (했다가 안했다가)
    @Transactional
    public boolean togglePlaceLike(Long placeId, String userEmail) {
        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // 이미 찜했는지 확인
        return placeLikeRepository.findByPlaceIdAndUserId(placeId, user.getId())
                .map(like -> {
                    placeLikeRepository.delete(like); // 있으면 삭제 (찜 취소)
                    return false; // 찜 안 함 상태
                })
                .orElseGet(() -> {
                    Place place = placeRepository.findById(placeId)
                            .orElseThrow(() -> new IllegalArgumentException("장소 없음"));
                    placeLikeRepository.save(new PlaceLike(place, user.getId())); // 없으면 저장 (찜 하기)
                    return true; // 찜 함 상태
                });
    }

    // ✅ 내가 찜한 장소 목록
    public List<PlaceDetailDto> getMyLikedPlaces(String userEmail) {
        User user = userRepository.findByEmail(userEmail).stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        List<PlaceLike> likes = placeLikeRepository.findByUserId(user.getId());

        return likes.stream().map(like -> {
            Place p = like.getPlace();
            // DTO 변환 (간략화)
            return PlaceDetailDto.builder()
                    .id(p.getId()).name(p.getName()).address(p.getAddress())
                    .mainCategory(p.getMainCategory()).subCategory(p.getSubCategory())
                    .lat(p.getLatitude()).lng(p.getLongitude()).rating(p.getRating())
                    .photoUrls(new ArrayList<>(p.getPhotoUrls()))
                    .tags(new ArrayList<>(p.getTags()))
                    .build();
        }).collect(Collectors.toList());
    }
}