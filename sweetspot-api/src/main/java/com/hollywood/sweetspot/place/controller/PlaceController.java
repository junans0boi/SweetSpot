package com.hollywood.sweetspot.place.controller;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import com.hollywood.sweetspot.place.service.GooglePlacesService;
import com.hollywood.sweetspot.place.service.PlaceService; // ✅ Import 추가
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // ✅ Import 추가
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final GooglePlacesService googlePlacesService;
    private final PlaceRepository placeRepository;
    
    // ✅ [필수 추가] PlaceService 주입
    private final PlaceService placeService;

    @GetMapping("/details/{id}")
    public ResponseEntity<PlaceDetailDto> getPlaceDetails(@PathVariable Long id) {
        try {
            PlaceDetailDto dto = googlePlacesService.getPlaceDetails(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/nearby")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PlaceDetailDto>> getNearbyPlaces(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3000") double radius) {
        
        List<Place> places = placeRepository.findNearbyPlaces(lat, lng, radius);

        List<PlaceDetailDto> response = places.stream().map(place -> {
            CategoryResult mapped = mapCategory(place.getMainCategory(), place.getSubCategory());
            return PlaceDetailDto.builder()
                    .id(place.getId())
                    .name(place.getName())
                    .address(place.getAddress())
                    .mainCategory(mapped.main)
                    .subCategory(mapped.sub)
                    .lat(place.getLatitude())
                    .lng(place.getLongitude())
                    .rating(place.getRating())
                    .photoUrls(new ArrayList<>(place.getPhotoUrls()))
                    .tags(new ArrayList<>(place.getTags()))
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

   @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PlaceDetailDto>> searchPlaces(
            @RequestParam String keyword,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Place> places = placeRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(keyword, keyword, pageable);
        
        Page<PlaceDetailDto> response = places.map(place -> {
             CategoryResult mapped = mapCategory(place.getMainCategory(), place.getSubCategory());
             return PlaceDetailDto.builder()
                    .id(place.getId())
                    .name(place.getName())
                    .address(place.getAddress())
                    .mainCategory(mapped.main)
                    .subCategory(mapped.sub)
                    .lat(place.getLatitude())
                    .lng(place.getLongitude())
                    .rating(place.getRating())
                    .photoUrls(new ArrayList<>(place.getPhotoUrls()))
                    .tags(new ArrayList<>(place.getTags()))
                    .build();
        });

        return ResponseEntity.ok(response);
    }

    // ✅ [추가] 찜 토글 API
    @PostMapping("/{id}/like")
    public ResponseEntity<Boolean> toggleLike(@PathVariable Long id, @AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(placeService.togglePlaceLike(id, userEmail));
    }

    // ✅ [추가] 내가 찜한 목록 API
    @GetMapping("/my-likes")
    public ResponseEntity<List<PlaceDetailDto>> getMyLikes(@AuthenticationPrincipal String userEmail) {
        return ResponseEntity.ok(placeService.getMyLikedPlaces(userEmail));
    }

    // --- 카테고리 매핑 헬퍼 메서드 ---
    private CategoryResult mapCategory(String dbMain, String dbSub) {
        if (dbMain == null)
            dbMain = "";
        if (dbSub == null)
            dbSub = "";

        // 1. 키즈카페 (특수 케이스: 음식점에 섞여 있음)
        if (dbSub.contains("키즈카페"))
            return new CategoryResult("문화/관광", "키즈카페");

        // 2. 카페/디저트 처리
        if (dbSub.contains("까페") || dbSub.contains("커피숍") || dbSub.contains("다방") || dbSub.contains("라이브카페")) {
            return new CategoryResult("카페", "카페");
        }
        if (dbSub.contains("제과점") || dbSub.contains("과자점"))
            return new CategoryResult("카페", "베이커리");
        if (dbSub.contains("아이스크림"))
            return new CategoryResult("카페", "아이스크림");
        if (dbSub.contains("떡카페") || dbSub.contains("전통찻집"))
            return new CategoryResult("카페", "전통찻집");

        // 3. 맛집 (일반음식점, 휴게음식점)
        if (dbMain.equals("일반음식점") || dbMain.equals("휴게음식점")) {
            if (dbSub.contains("한식") || dbSub.contains("냉면") || dbSub.contains("탕류"))
                return new CategoryResult("맛집", "한식");
            if (dbSub.contains("식육") || dbSub.contains("숯불"))
                return new CategoryResult("맛집", "고기/구이");
            if (dbSub.contains("일식") || dbSub.contains("횟집") || dbSub.contains("복어"))
                return new CategoryResult("맛집", "일식/횟집");
            if (dbSub.contains("중국"))
                return new CategoryResult("맛집", "중식");
            if (dbSub.contains("경양식") || dbSub.contains("패밀리레스트랑"))
                return new CategoryResult("맛집", "양식");
            if (dbSub.contains("통닭") || dbSub.contains("호프") || dbSub.contains("치킨"))
                return new CategoryResult("맛집", "치킨");
            if (dbSub.contains("소주") || dbSub.contains("포차") || dbSub.contains("주점"))
                return new CategoryResult("맛집", "술집/포차");
            if (dbSub.contains("분식") || dbSub.contains("김밥"))
                return new CategoryResult("맛집", "분식");
            if (dbSub.contains("패스트푸드"))
                return new CategoryResult("맛집", "패스트푸드");
            if (dbSub.contains("뷔페") || dbSub.contains("출장"))
                return new CategoryResult("맛집", "뷔페");
            if (dbSub.contains("외국"))
                return new CategoryResult("맛집", "세계음식");

            return new CategoryResult("맛집", "기타"); // 매핑 안 된 음식점
        }

        // 4. 놀거리
        if (dbMain.contains("인터넷컴퓨터"))
            return new CategoryResult("놀거리", "PC방");
        if (dbMain.contains("노래연습장"))
            return new CategoryResult("놀거리", "노래방");
        if (dbMain.contains("당구장"))
            return new CategoryResult("놀거리", "당구장");
        if (dbMain.contains("게임제공업") || dbMain.contains("복합영상물"))
            return new CategoryResult("놀거리", "오락실/멀티방");
        if (dbMain.contains("목욕"))
            return new CategoryResult("놀거리", "찜질방");
        if (dbMain.contains("체력") || dbMain.contains("체육"))
            return new CategoryResult("놀거리", "헬스/스포츠");
        if (dbMain.contains("빙상") || dbMain.contains("스키") || dbMain.contains("썰매"))
            return new CategoryResult("놀거리", "스포츠");

        // 5. 문화/관광
        if (dbMain.contains("영화"))
            return new CategoryResult("문화/관광", "영화관");
        if (dbMain.contains("공연"))
            return new CategoryResult("문화/관광", "공연장");
        if (dbMain.contains("테마파크"))
            return new CategoryResult("문화/관광", "테마파크");
        if (dbMain.contains("박물관") || dbMain.contains("미술관"))
            return new CategoryResult("문화/관광", "박물관/미술관");

        // 6. 기타
        return new CategoryResult("기타", dbSub.isEmpty() ? dbMain : dbSub);
    }

    // 내부 헬퍼 클래스
    private static class CategoryResult {
        String main;
        String sub;

        public CategoryResult(String main, String sub) {
            this.main = main;
            this.sub = sub;
        }
    }
}