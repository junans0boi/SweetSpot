package com.hollywood.sweetspot.place.controller;

import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import com.hollywood.sweetspot.place.service.GooglePlacesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final GooglePlacesService googlePlacesService;

    /**
     * ✅ [수정] 프론트엔드에서 우리 DB의 id(Long)를 보내면,
     * 서비스가 Google Place ID를 찾거나 캐시된 데이터를 반환합니다.
     * 예: GET /api/places/details/123
     */
    @GetMapping("/details/{id}")
    public ResponseEntity<PlaceDetailDto> getPlaceDetails(@PathVariable Long id) {
        try {
            PlaceDetailDto dto = googlePlacesService.getPlaceDetails(id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            // e.printStackTrace(); // 디버깅용
            return ResponseEntity.notFound().build();
        }
    }
}

