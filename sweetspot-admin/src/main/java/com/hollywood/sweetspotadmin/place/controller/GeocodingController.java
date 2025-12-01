package com.hollywood.sweetspotadmin.place.controller;

import com.hollywood.sweetspotadmin.place.service.GeocodingBatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/geocoding")
@RequiredArgsConstructor
public class GeocodingController {

    private final GeocodingBatchService geocodingBatchService;

    @PostMapping("/run")
    public ResponseEntity<String> runGeocoding() {
        geocodingBatchService.processMissingCoordinates();
        return ResponseEntity.ok("지오코딩 프로세스가 수동으로 시작되었습니다.");
    }
}
