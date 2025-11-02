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
     * 프론트엔드에서 placeId를 보내면 Google Places API에서 상세정보를 반환
     * 예: GET /api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4
     */
    @GetMapping("/details")
    public ResponseEntity<PlaceDetailDto> getPlaceDetails(@RequestParam String placeId) {
        PlaceDetailDto dto = googlePlacesService.getPlaceDetails(placeId);
        return ResponseEntity.ok(dto);
    }
}