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

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
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
    @Transactional
    public void processMissingCoordinates() {
        log.info("[GeocodingBatch] 좌표가 누락된 장소에 대한 지오코딩 시작.");
        int processedCount = 0;
        int successCount = 0;

        // 한 번에 BATCH_SIZE 만큼 가져와서 처리
        Pageable pageable = PageRequest.of(0, BATCH_SIZE);

        while (processedCount < GEOCODING_LIMIT_PER_DAY) {
            // 좌표(geom)와 EPSG좌표가 모두 없는 데이터 조회
            Page<Place> placesToProcess = placeRepository.findByGeomIsNullAndEpsg5174xIsNull(pageable);

            if (placesToProcess.isEmpty()) {
                log.info("[GeocodingBatch] 처리할 장소가 더 이상 없습니다.");
                break;
            }

            for (Place place : placesToProcess.getContent()) {
                // 일일 제한 체크
                if (processedCount >= GEOCODING_LIMIT_PER_DAY) {
                    log.warn("[GeocodingBatch] 일일 API 제한({}) 도달. 배치를 중단합니다.", GEOCODING_LIMIT_PER_DAY);
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
                    // ✅ [수정됨] 좌표만 저장하고, Google Place ID는 저장하지 않습니다.
                    // 이유: Geocoding API는 건물 단위의 ID를 반환하므로, 같은 건물 내 매장들이 중복 ID 오류를 일으킴.
                    // 정확한 매장 ID(Place ID) 적재는 프론트엔드 상세 조회 시 Places API를 통해 수행하도록 위임.
                    
                    place.setGeom(geocodeResult.getPoint());
                    // place.setGooglePlaceId(geocodeResult.getGooglePlaceId()); // ❌ 주석 처리됨 (중복 방지)

                    placeRepository.save(place);
                    successCount++;
                    log.debug("[GeocodingBatch] 좌표 갱신 성공 - Place ID: {}, 주소: {}", place.getId(), successAddress);
                } else {
                    // 모든 후보 주소로도 실패한 경우
                    log.warn("[GeocodingBatch] 모든 시도 실패. Place ID: {}, 원본주소: {}", place.getId(), place.getRoadAddress());
                }

                // 다음 요청 전 딜레이
                sleep(API_CALL_DELAY_MS);
            }

            // 더 이상 처리할 페이지가 없거나 제한에 도달하면 종료
            if (processedCount >= GEOCODING_LIMIT_PER_DAY || !placesToProcess.hasNext()) {
                break;
            }
        }

        log.info("[GeocodingBatch] 배치 완료. API 호출: {}, 성공(좌표갱신): {}", processedCount, successCount);
    }

    /**
     * 주소 정제 로직
     * 예: "서울특별시 은평구 진관3로 33, 지하1층 B104호 (진관동)" -> "서울특별시 은평구 진관3로 33"
     */
    private String cleanAddress(String address) {
        if (!StringUtils.hasText(address)) return null;

        // 1. 괄호와 괄호 안의 내용 제거
        String noParenthesis = address.replaceAll("\\(.*?\\)", " ");

        // 2. 콤마(,) 기준으로 자르고 첫 번째 부분만 사용 (상세주소 제거)
        String mainAddress = noParenthesis.split(",")[0];

        // 3. 앞뒤 공백 제거
        return mainAddress.trim();
    }

    /**
     * Google Geocoding API 호출
     */
    private GeocodeResult callGeocodeApi(String address) {
        if (!StringUtils.hasText(address)) return null;

        final int MAX_RETRIES = 3;
        long retryDelayMs = 1000;
        String searchAddress = address;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // ✅ [수정됨] URI 객체를 직접 생성하여 RestTemplate에 전달 (인코딩 문제 해결)
                URI uri = UriComponentsBuilder
                        .fromUriString(googleApiUrl)
                        .queryParam("address", searchAddress)
                        .queryParam("key", googleApiKey)
                        .queryParam("language", "ko")
                        .build()
                        .toUri();

                // log.debug("Requesting Google API: {}", uri); // 필요시 주석 해제

                ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
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
                    // 검색 결과가 없는 경우 재시도하지 않음
                    log.debug("Google API ZERO_RESULTS: {}", searchAddress);
                    return null;
                } else if ("REQUEST_DENIED".equals(status) || "INVALID_REQUEST".equals(status)) {
                    // 키 문제나 잘못된 요청은 재시도해도 소용없음
                    log.error("Google API Critical Error: {}", status);
                    return null;
                }

                log.warn("Google API 비정상 상태(재시도 예정): {}, 주소: {}", status, searchAddress);

            } catch (Exception e) {
                log.error("Google API 호출 오류: {} (시도 {}/{})", searchAddress, attempt, MAX_RETRIES, e);
            }

            // 재시도 전 대기
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