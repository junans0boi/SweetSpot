package com.hollywood.sweetspot.place.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.hollywood.sweetspot.place.model.Place;
import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import com.hollywood.sweetspot.place.dto.ReviewWithPhotosDto;
import com.hollywood.sweetspot.place.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePlacesService {

    @Value("${GOOGLE_PLACES_API_KEY}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PlaceRepository placeRepository; // ✅ DB 접근을 위한 Repository

    /**
     * ✅ [핵심 수정] 스마트 캐싱 로직
     */
    @Transactional
    public PlaceDetailDto getPlaceDetails(Long id) {
        // 1. DB에서 우리 ID로 장소를 찾습니다.
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("장소를 찾을 수 없습니다. ID: " + id));

        // 2. [캐시 확인] 이미 Google 상세 정보가 저장되어 있는지 확인합니다.
        if (place.isDetailsCached()) {
            log.info("캐시된 상세 정보를 반환합니다: {}", place.getName());
            return buildDtoFromPlace(place); // DB 데이터로 DTO를 만들어 즉시 반환
        }

        // 3. [캐시 없음] Google Place ID 찾기 (DB에 없으면 API로 검색)
        String googlePlaceId = place.getGooglePlaceId();
        if (googlePlaceId == null) {
            googlePlaceId = findGooglePlaceId(place.getName(), place.getAddress());
            if (googlePlaceId == null) {
                // Google에서 못찾아도 일단 DTO는 반환 (캐시 저장은 안함)
                log.warn("Google Places API에서 장소를 찾을 수 없습니다: {}", place.getName());
                return buildDtoFromPlace(place); 
            }
        }

        // 4. Google Places API에서 상세 정보 호출
        JsonNode details = fetchDetailsFromGoogle(googlePlaceId);

        // 5. [캐시 저장] 호출한 상세 정보를 DB의 place 엔티티에 업데이트
        updatePlaceWithGoogleData(place, details, googlePlaceId);
        placeRepository.save(place);
        log.info("Google API 정보를 DB에 캐시했습니다: {}", place.getName());

        // 6. DTO로 변환하여 반환
        return buildDtoFromPlace(place);
    }

    /**
     * Google Text Search API를 이용해 장소 ID를 검색합니다.
     */
    private String findGooglePlaceId(String name, String address) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/place/findplacefromtext/json")
                    .queryParam("input", name + " " + address)
                    .queryParam("inputtype", "textquery")
                    .queryParam("fields", "place_id")
                    .queryParam("key", apiKey)
                    .queryParam("language", "ko")
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidate = root.path("candidates").path(0);
            if (!candidate.isMissingNode()) {
                return candidate.path("place_id").asText(null);
            }
            return null;
        } catch (Exception e) {
            log.error("findGooglePlaceId 실패", e);
            return null;
        }
    }

    /**
     * Google Place Details API를 호출합니다.
     */
    private JsonNode fetchDetailsFromGoogle(String googlePlaceId) {
        try {
            String url = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/place/details/json")
                    .queryParam("place_id", googlePlaceId)
                    .queryParam("fields", "name,formatted_address,geometry,photos,rating,website,opening_hours,reviews")
                    .queryParam("key", apiKey)
                    .queryParam("language", "ko")
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("result");
        } catch (Exception e) {
            throw new RuntimeException("fetchDetailsFromGoogle 실패", e);
        }
    }

    /**
     * Google API 응답(JsonNode)을 Place 엔티티에 업데이트합니다.
     */
    private void updatePlaceWithGoogleData(Place place, JsonNode details, String googlePlaceId) {
        place.setGooglePlaceId(googlePlaceId);
        place.setRating(details.path("rating").asDouble(place.getRating())); // Google 평점이 있으면 덮어쓰기
        place.setWebsite(details.path("website").asText(null));

        List<String> photoUrls = extractPhotos(details.path("photos"));
        if (!photoUrls.isEmpty()) {
            place.setPhotoUrls(photoUrls);
        }

        List<String> openingHours = extractArray(details.path("opening_hours").path("weekday_text"));
        place.setOpeningHours(openingHours);

        // 리뷰 데이터를 JSON 문자열로 저장
        JsonNode reviewsNode = details.path("reviews");
        if (reviewsNode.isArray()) {
            place.setReviewsJson(reviewsNode.toString());
        }

        place.setDetailsCached(true); // 캐시 완료 플래그 설정
    }

    /**
     * Place 엔티티를 PlaceDetailDto로 변환합니다.
     */
    private PlaceDetailDto buildDtoFromPlace(Place place) {
        List<ReviewWithPhotosDto> reviews = new ArrayList<>();
        if (place.getReviewsJson() != null) {
            try {
                ArrayNode reviewsNode = (ArrayNode) objectMapper.readTree(place.getReviewsJson());
                reviews = StreamSupport.stream(reviewsNode.spliterator(), false)
                        .map(reviewNode -> ReviewWithPhotosDto.builder()
                                .authorName(reviewNode.path("author_name").asText())
                                .text(reviewNode.path("text").asText())
                                .rating(reviewNode.path("rating").asDouble())
                                .photoUrls(Collections.emptyList()) // 리뷰 사진은 별도 파싱 필요 (간소화)
                                .build())
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.error("캐시된 리뷰 JSON 파싱 실패", e);
            }
        }

        return PlaceDetailDto.builder()
                .name(place.getName())
                .address(place.getAddress())
                // ✅ [수정] place.getCoordinate().getLatitude() -> place.getLatitude()
                .lat(place.getLatitude())
                // ✅ [수정] place.getCoordinate().getLongitude() -> place.getLongitude()
                .lng(place.getLongitude())
                .rating(place.getRating())
                .website(place.getWebsite())
                .photoUrls(place.getPhotoUrls() != null && !place.getPhotoUrls().isEmpty() ? place.getPhotoUrls() : List.of(place.getImage()))
                .openingHours(place.getOpeningHours())
                .reviews(reviews)
                .build();
    }

    // ✅ [수정] 오류를 유발하는 / 기호 삭제
    private List<String> extractPhotos(JsonNode photoNodes) {
        if (photoNodes == null || !photoNodes.isArray())
            return Collections.emptyList();
        return StreamSupport.stream(photoNodes.spliterator(), false)
                .map(photo -> buildPhotoUrl(photo.path("photo_reference").asText()))
                .collect(Collectors.toList());
    }

    private List<String> extractArray(JsonNode node) {
        if (node == null || !node.isArray())
            return Collections.emptyList();
        return StreamSupport.stream(node.spliterator(), false)
                .map(JsonNode::asText)
                .collect(Collectors.toList());
    }

    private String buildPhotoUrl(String photoReference) {
        return String.format(
                "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=%s&key=%s",
                photoReference, apiKey);
    }
}

