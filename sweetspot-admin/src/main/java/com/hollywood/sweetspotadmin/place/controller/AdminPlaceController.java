package com.hollywood.sweetspotadmin.place.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
// Core 모듈의 Entity와 Repository Import
import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import com.hollywood.sweetspotadmin.place.dto.PlaceSummaryDto;
import com.hollywood.sweetspotadmin.place.dto.PlaceUpdateRequest;
import com.hollywood.sweetspotadmin.place.dto.ReviewDto;
import com.hollywood.sweetspotadmin.place.service.CsvUploadService;
import com.hollywood.sweetspotadmin.place.service.DataTransformBatchService;
import com.hollywood.sweetspotadmin.place.service.GeocodingBatchService;
import com.hollywood.sweetspotadmin.place.service.JobStatusService;
import com.hollywood.sweetspotadmin.place.service.JsonImportService;
import com.hollywood.sweetspotadmin.place.specification.PlaceSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
public class AdminPlaceController {

    private final PlaceRepository placeRepository;
    private final CsvUploadService csvUploadService;
    private final JsonImportService jsonImportService;
    private final JobStatusService jobStatusService;
    private final GeocodingBatchService geocodingBatchService;
    private final DataTransformBatchService dataTransformBatchService;
    private final ObjectMapper objectMapper;

    @Value("${csv.directory-path}")
    private String csvPath;

    @Value("${project.root-path}")
    private String projectRootPath;

    @GetMapping
    public ResponseEntity<Page<PlaceSummaryDto>> getAllPlaces(
            @RequestParam(required = false) String mainCategory,
            @RequestParam(required = false) String keyword,
            Pageable pageable) {

        Specification<Place> spec = PlaceSpecification.search(mainCategory, keyword);
        Page<Place> placePage = placeRepository.findAll(spec, pageable);
        Page<PlaceSummaryDto> dtoPage = placePage.map(PlaceSummaryDto::from);

        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getPlaceCategories() {
        return ResponseEntity.ok(placeRepository.findDistinctMainCategories());
    }

    @PostMapping("/import-json")
    public ResponseEntity<String> loadDataFromJson() {
        if (jobStatusService.isJobRunning()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 다른 임포트 작업이 진행 중입니다.");
        }
        String jobId = UUID.randomUUID().toString();
        log.info("JSON 임포트 작업 시작. Job ID: {}", jobId);
        jsonImportService.importFromJsonFile(jobId, projectRootPath);
        return ResponseEntity.ok(jobId);
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<String> getJobStatus(@PathVariable String jobId) {
        String status = jobStatusService.getStatus(jobId);
        return ResponseEntity.ok("{\"status\": \"" + status + "\"}");
    }

    @PostMapping("/load-from-disk")
    public ResponseEntity<String> loadAllCsvFilesFromDisk() {
        String jobId = UUID.randomUUID().toString();
        log.info("CSV 일괄 적재 작업 시작. Job ID: {}", jobId);
        csvUploadService.loadAllCsvFilesFromDisk(jobId, csvPath);
        return ResponseEntity.ok(jobId);
    }

    @GetMapping("/load-from-disk/status/{jobId}")
    public ResponseEntity<String> getCsvJobStatus(@PathVariable String jobId) {
         String status = jobStatusService.getStatus(jobId);
         return ResponseEntity.ok("{\"status\": \"" + status + "\"}");
    }

    @PostMapping("/geocoding/run")
    public ResponseEntity<String> runGeocodingBatch() {
        log.info("수동 지오코딩 배치 작업 시작 요청.");
        geocodingBatchService.processMissingCoordinates();
        return ResponseEntity.ok("지오코딩 배치 작업이 시작되었습니다.");
    }

    @PostMapping("/transform/run")
    public ResponseEntity<String> runDataTransformBatch() {
        log.info("수동 데이터 변환 배치 작업 시작 요청.");
        dataTransformBatchService.transformRawToProductionBatch();
        return ResponseEntity.ok("데이터 변환 배치 작업이 시작되었습니다.");
    }

    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllPlaces() {
        try {
            long count = placeRepository.count();
            placeRepository.deleteAllInBatch();
            return ResponseEntity.ok(count + "개의 장소 데이터를 모두 삭제했습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("데이터 삭제 중 오류 발생: " + e.getMessage());
        }
    }

    @PutMapping("/{placeId}")
    @Transactional
    public ResponseEntity<PlaceSummaryDto> updatePlace(
            @PathVariable Long placeId,
            @RequestBody PlaceUpdateRequest request) {
        
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("장소를 찾을 수 없습니다. ID: " + placeId));

        place.setName(request.getName());
        place.setAddress(request.getAddress());
        place.setMainCategory(request.getMainCategory());
        place.setSubCategory(request.getSubCategory());
        
        Place updatedPlace = placeRepository.save(place);
        return ResponseEntity.ok(PlaceSummaryDto.from(updatedPlace));
    }

    @DeleteMapping("/{placeId}")
    @Transactional
    public ResponseEntity<Void> deletePlace(@PathVariable Long placeId) {
        if (!placeRepository.existsById(placeId)) {
            throw new RuntimeException("장소를 찾을 수 없습니다. ID: " + placeId);
        }
        placeRepository.deleteById(placeId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{placeId}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviewsForPlace(@PathVariable Long placeId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("장소를 찾을 수 없습니다. ID: " + placeId));

        if (!StringUtils.hasText(place.getReviewsJson())) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        try {
            List<ReviewDto> reviews = objectMapper.readValue(place.getReviewsJson(),
                    new TypeReference<List<ReviewDto>>() {});
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            log.error("리뷰 JSON 파싱 실패 (Place ID: {})", placeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{placeId}/reviews")
    public ResponseEntity<Void> deleteReviewsForPlace(@PathVariable Long placeId) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("장소를 찾을 수 없습니다. ID: " + placeId));

        place.setReviewsJson(null);
        place.setDetailsCached(false); 
        placeRepository.save(place);

        return ResponseEntity.noContent().build();
    }
}