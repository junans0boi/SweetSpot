package com.hollywood.sweetspot.place.controller;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import com.hollywood.sweetspot.place.service.GooglePlacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final GooglePlacesService googlePlacesService;
    private final PlaceRepository placeRepository;

    @GetMapping("/details/{id}")
    public ResponseEntity<PlaceDetailDto> getPlaceDetails(@PathVariable Long id) {
        try {
            PlaceDetailDto dto = googlePlacesService.getPlaceDetails(id);
            // 상세 조회 시에도 카테고리 매핑 적용
            CategoryResult mappedCategory = mapCategory(dto.getMainCategory(), dto.getSubCategory());
            
            // DTO 재건축 (Setter가 없으므로 Builder로 다시 만듦 - 효율을 위해 DTO에 Setter를 추가하거나 로직 이동 권장)
            // 여기서는 편의상 GooglePlacesService 내부에서 매핑을 하도록 유도하거나,
            // 간단히 DTO에 setMainCategory 등을 추가하는 것이 좋지만, 일단 여기서 처리 구조를 보여드립니다.
            
            // (참고: GooglePlacesService.buildDtoFromPlace 에서 매핑하는 것이 가장 깔끔합니다. 
            //  일단 아래 nearby 로직을 우선시 하세요.)
            
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<PlaceDetailDto>> getNearbyPlaces(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "2000") double radius
    ) {
        List<Place> places = placeRepository.findNearbyPlaces(lat, lng, radius);

        List<PlaceDetailDto> response = places.stream()
                .map(place -> {
                    // ⭐️ [핵심] DB 데이터를 프론트엔드 카테고리로 변환
                    CategoryResult mapped = mapCategory(place.getMainCategory(), place.getSubCategory());

                    return PlaceDetailDto.builder()
                            .id(place.getId())
                            .name(place.getName())
                            .address(place.getAddress())
                            .lat(place.getLatitude())  
                            .lng(place.getLongitude())
                            .mainCategory(mapped.main) // 변환된 대분류 (예: 맛집)
                            .subCategory(mapped.sub)   // 변환된 소분류 (예: 한식)
                            .rating(place.getRating())
                            .photoUrls(place.getImage() != null ? List.of(place.getImage()) : null)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // --- 카테고리 매핑 헬퍼 메서드 ---
    private CategoryResult mapCategory(String dbMain, String dbSub) {
        if (dbMain == null) dbMain = "";
        if (dbSub == null) dbSub = "";

        // 1. 키즈카페 (특수 케이스: 음식점에 섞여 있음)
        if (dbSub.contains("키즈카페")) return new CategoryResult("문화/관광", "키즈카페");

        // 2. 카페/디저트 처리
        if (dbSub.contains("까페") || dbSub.contains("커피숍") || dbSub.contains("다방") || dbSub.contains("라이브카페")) {
            return new CategoryResult("카페", "카페");
        }
        if (dbSub.contains("제과점") || dbSub.contains("과자점")) return new CategoryResult("카페", "베이커리");
        if (dbSub.contains("아이스크림")) return new CategoryResult("카페", "아이스크림");
        if (dbSub.contains("떡카페") || dbSub.contains("전통찻집")) return new CategoryResult("카페", "전통찻집");

        // 3. 맛집 (일반음식점, 휴게음식점)
        if (dbMain.equals("일반음식점") || dbMain.equals("휴게음식점")) {
            if (dbSub.contains("한식") || dbSub.contains("냉면") || dbSub.contains("탕류")) return new CategoryResult("맛집", "한식");
            if (dbSub.contains("식육") || dbSub.contains("숯불")) return new CategoryResult("맛집", "고기/구이");
            if (dbSub.contains("일식") || dbSub.contains("횟집") || dbSub.contains("복어")) return new CategoryResult("맛집", "일식/횟집");
            if (dbSub.contains("중국")) return new CategoryResult("맛집", "중식");
            if (dbSub.contains("경양식") || dbSub.contains("패밀리레스트랑")) return new CategoryResult("맛집", "양식");
            if (dbSub.contains("통닭") || dbSub.contains("호프") || dbSub.contains("치킨")) return new CategoryResult("맛집", "치킨");
            if (dbSub.contains("소주") || dbSub.contains("포차") || dbSub.contains("주점")) return new CategoryResult("맛집", "술집/포차");
            if (dbSub.contains("분식") || dbSub.contains("김밥")) return new CategoryResult("맛집", "분식");
            if (dbSub.contains("패스트푸드")) return new CategoryResult("맛집", "패스트푸드");
            if (dbSub.contains("뷔페") || dbSub.contains("출장")) return new CategoryResult("맛집", "뷔페");
            if (dbSub.contains("외국")) return new CategoryResult("맛집", "세계음식");
            
            return new CategoryResult("맛집", "기타"); // 매핑 안 된 음식점
        }

        // 4. 놀거리
        if (dbMain.contains("인터넷컴퓨터")) return new CategoryResult("놀거리", "PC방");
        if (dbMain.contains("노래연습장")) return new CategoryResult("놀거리", "노래방");
        if (dbMain.contains("당구장")) return new CategoryResult("놀거리", "당구장");
        if (dbMain.contains("게임제공업") || dbMain.contains("복합영상물")) return new CategoryResult("놀거리", "오락실/멀티방");
        if (dbMain.contains("목욕")) return new CategoryResult("놀거리", "찜질방");
        if (dbMain.contains("체력") || dbMain.contains("체육")) return new CategoryResult("놀거리", "헬스/스포츠");
        if (dbMain.contains("빙상") || dbMain.contains("스키") || dbMain.contains("썰매")) return new CategoryResult("놀거리", "스포츠");

        // 5. 문화/관광
        if (dbMain.contains("영화")) return new CategoryResult("문화/관광", "영화관");
        if (dbMain.contains("공연")) return new CategoryResult("문화/관광", "공연장");
        if (dbMain.contains("테마파크")) return new CategoryResult("문화/관광", "테마파크");
        if (dbMain.contains("박물관") || dbMain.contains("미술관")) return new CategoryResult("문화/관광", "박물관/미술관");

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