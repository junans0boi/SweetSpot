package com.hollywood.sweetspot.place.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import com.hollywood.sweetspot.global.service.GeminiService;
import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional; // ✅ [추가]
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList; // ✅ [추가]
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sweet-pick")
@RequiredArgsConstructor
public class SweetPickController {

    private final PlaceRepository placeRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @GetMapping("/recommend")
    @Transactional // ✅ [핵심 1] 트랜잭션 유지 (Lazy Loading 가능하게 함)
    public ResponseEntity<?> getAiRecommendation(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String mood) {
        // 1. 후보군 조회
        List<Place> nearbyPlaces = placeRepository.findNearbyPlaces(lat, lng, 3000);
        List<Place> candidates = nearbyPlaces.stream().filter(p -> p.getRating() >= 3.5).collect(Collectors.toList());

        if (candidates.isEmpty())
            candidates = nearbyPlaces;

        Collections.shuffle(candidates);

        // 후보군 10개로 제한
        List<Place> finalCandidates = candidates.subList(0, Math.min(candidates.size(), 10));

        if (finalCandidates.isEmpty())
            return ResponseEntity.badRequest().body("추천할 장소가 없어요.");

        // 2. AI 요청
        List<Map<String, Object>> aiRecommendations = geminiService.getRecommendations(finalCandidates, mood);

        try {
            List<Map<String, Object>> resultList = new ArrayList<>();

            for (Map<String, Object> aiRes : aiRecommendations) {
                int index = (int) aiRes.get("index") - 1;
                String reason = (String) aiRes.get("reason");

                if (index >= 0 && index < finalCandidates.size()) {
                    Place p = finalCandidates.get(index);

                    // DTO 변환
                    PlaceDetailDto placeDto = PlaceDetailDto.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .address(p.getAddress())
                            .mainCategory(p.getMainCategory())
                            .subCategory(p.getSubCategory())
                            .lat(p.getLatitude())
                            .lng(p.getLongitude())
                            .rating(p.getRating())
                            // 강제 초기화 (Lazy Loading 데이터 가져오기)
                            .photoUrls(new ArrayList<>(p.getPhotoUrls()))
                            // 태그 매핑 (Lazy Loading 방지 위해 new ArrayList 권장)
                            .tags(new ArrayList<>(p.getTags()))
                            .build();

                    resultList.add(Map.of(
                            "place", placeDto,
                            "aiComment", reason));
                }
            }

            // 3. 결과 반환
            return ResponseEntity.ok(resultList);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("AI 추천 처리 중 오류가 발생했습니다.");
        }
    }
}