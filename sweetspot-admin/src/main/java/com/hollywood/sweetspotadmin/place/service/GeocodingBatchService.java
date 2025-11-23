package com.hollywood.sweetspotadmin.place.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.place.repository.PlaceRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@EnableScheduling
@EnableAsync
@RequiredArgsConstructor
public class GeocodingBatchService {

    @Getter
    @Setter
    @AllArgsConstructor
    private static class GeocodeResult {
        private Point point;
        private String googlePlaceId;
    }

    @Value("${google.api.key}")
    private String googleApiKey;
    @Value("${google.api.url}")
    private String googleApiUrl;

    private final PlaceRepository placeRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    
    private static final int GEOCODING_LIMIT_PER_DAY = 39000;
    private static final int BATCH_SIZE = 100;
    private static final long API_CALL_DELAY_MS = 100;

    @Async
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void processMissingCoordinates() {
        log.info("[GeocodingBatch] 좌표가 누락된 장소에 대한 지오코딩 시작.");
        int processedCount = 0;
        int successCount = 0;
        
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);

        while (processedCount < GEOCODING_LIMIT_PER_DAY) {
            Page<Place> placesToProcess = placeRepository.findByGeomIsNullAndEpsg5174xIsNull(pageable);

            if (placesToProcess.isEmpty()) {
                log.info("[GeocodingBatch] 처리할 장소가 더 이상 없습니다.");
                break;
            }

            for (Place place : placesToProcess.getContent()) {
                if (processedCount >= GEOCODING_LIMIT_PER_DAY) {
                    log.warn("[GeocodingBatch] 일일 API 제한({}) 도달.", GEOCODING_LIMIT_PER_DAY);
                    break;
                }

                // 1. 시도할 주소 후보군 생성 (우선순위: 도로명 -> 지번)
                List<String> addressCandidates = new ArrayList<>();
                
                // 도로명 주소 정제 (괄호 제거 및 콤마 앞부분 추출)
                if (StringUtils.hasText(place.getRoadAddress())) {
                    addressCandidates.add(cleanAddress(place.getRoadAddress()));
                }
                
                // 지번 주소 정제
                if (StringUtils.hasText(place.getJibunAddress())) {
                    addressCandidates.add(cleanAddress(place.getJibunAddress()));
                }

                GeocodeResult geocodeResult = null;
                String successAddress = null;

                // 2. 후보군 순회하며 API 호출 (성공할 때까지 시도)
                for (String candidate : addressCandidates) {
                    if (!StringUtils.hasText(candidate)) continue;

                    geocodeResult = callGeocodeApi(candidate);
                    processedCount++; // API 호출 횟수 증가

                    if (geocodeResult != null) {
                        successAddress = candidate;
                        break; // 성공하면 루프 탈출
                    }
                    
                    // 실패시 API 딜레이 (너무 빠른 재시도 방지)
                    sleep(API_CALL_DELAY_MS);
                }

                // 3. 결과 저장
                if (geocodeResult != null && geocodeResult.getPoint() != null) {
                    place.setGeom(geocodeResult.getPoint());
                    place.setGooglePlaceId(geocodeResult.getGooglePlaceId());
                    placeRepository.save(place);
                    successCount++;
                    log.debug("[GeocodingBatch] 성공 Place ID: {}, 주소: {}", place.getId(), successAddress);
                } else {
                    log.warn("[GeocodingBatch] 모든 시도 실패. Place ID: {}, 원본주소: {}", place.getId(), place.getRoadAddress());
                }

                sleep(API_CALL_DELAY_MS);
            }

            if (processedCount >= GEOCODING_LIMIT_PER_DAY || !placesToProcess.hasNext()) {
                break;
            }
        }

        log.info("[GeocodingBatch] 배치 완료. API 호출: {}, 성공: {}", processedCount, successCount);
    }

    /**
     * 주소 정제 로직
     * 예: "서울특별시 은평구 진관3로 33, 지하1층 B104호 (진관동)" -> "서울특별시 은평구 진관3로 33"
     * 예: "서울 송파구 법원로11길 7 (문정동)" -> "서울 송파구 법원로11길 7"
     */
    private String cleanAddress(String address) {
        if (!StringUtils.hasText(address)) return null;
        
        // 1. 괄호와 괄호 안의 내용 제거
        String noParenthesis = address.replaceAll("\\(.*?\\)", " ");
        
        // 2. 콤마(,) 기준으로 자르고 첫 번째 부분만 사용
        String mainAddress = noParenthesis.split(",")[0];
        
        // 3. 앞뒤 공백 제거
        return mainAddress.trim();
    }

    private GeocodeResult callGeocodeApi(String address) {
        if (!StringUtils.hasText(address)) return null;

        final int MAX_RETRIES = 3;
        long retryDelayMs = 1000;

        // 구글 API 정확도를 높이기 위해 국가명 추가 (선택사항이나 권장됨)
        // 이미 주소에 '서울' 등이 포함되어 있어도 South Korea를 붙이면 명확해짐
        String searchAddress = address; // 필요시 + " South Korea";

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                String url = UriComponentsBuilder
                        .fromUriString(googleApiUrl)
                        .queryParam("address", searchAddress)
                        .queryParam("key", googleApiKey)
                        .queryParam("language", "ko") // 한국어 결과 요청
                        .toUriString();

                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                JsonNode root = objectMapper.readTree(response.getBody());
                String status = root.path("status").asText();

                if ("OK".equals(status)) {
                    JsonNode results = root.path("results");
                    if (results.isArray() && results.size() > 0) {
                        JsonNode firstResult = results.get(0);
                        JsonNode location = firstResult.path("geometry").path("location");
                        double lon = location.path("lng").asDouble();
                        double lat = location.path("lat").asDouble();
                        String googlePlaceId = firstResult.path("place_id").asText();

                        return new GeocodeResult(geometryFactory.createPoint(new Coordinate(lon, lat)), googlePlaceId);
                    }
                } else if ("ZERO_RESULTS".equals(status)) {
                    // ZERO_RESULTS는 재시도해도 소용없으므로 즉시 리턴
                    log.debug("Google API ZERO_RESULTS: {}", searchAddress);
                    return null;
                }

                log.warn("Google API 비정상 상태: {}, 주소: {}", status, searchAddress);
                return null;

            } catch (Exception e) {
                log.error("Google API 호출 오류: {} (시도 {}/{})", searchAddress, attempt, MAX_RETRIES, e);
            }

            if (attempt < MAX_RETRIES) sleep(retryDelayMs);
        }
        return null;
    }
    
    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}   