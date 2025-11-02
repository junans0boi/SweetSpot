package com.hollywood.sweetspot.place.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hollywood.sweetspot.place.dto.PlaceDetailDto;
import com.hollywood.sweetspot.place.dto.ReviewWithPhotosDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePlacesService {

    @Value("${google.places.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Google Places API Place Details 호출
     */
    public PlaceDetailDto getPlaceDetails(String placeId) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://maps.googleapis.com/maps/api/place/details/json")
                    .queryParam("place_id", placeId)
                    .queryParam("fields", "name,formatted_address,geometry,photos,rating,website,opening_hours,reviews")
                    .queryParam("key", apiKey)
                    .queryParam("language", "ko") // 리뷰 등을 한국어로 받기
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode result = root.path("result");

            // 매장 기본 정보
            String name = result.path("name").asText(null);
            String address = result.path("formatted_address").asText(null);
            double lat = result.path("geometry").path("location").path("lat").asDouble();
            double lng = result.path("geometry").path("location").path("lng").asDouble();
            Double rating = result.has("rating") ? result.get("rating").asDouble() : null;
            String website = result.has("website") ? result.get("website").asText() : null;

            // 장소 대표 사진 URL
            List<String> photos = extractPhotos(result.path("photos"));

            // 영업시간
            List<String> openingHours = extractArray(result.path("opening_hours").path("weekday_text"));

            // 리뷰와 사진 조합
            List<ReviewWithPhotosDto> reviews = combineReviewsAndPhotos(result.path("reviews"), result.path("photos"));

            return PlaceDetailDto.builder()
                    .name(name)
                    .address(address)
                    .lat(lat)
                    .lng(lng)
                    .rating(rating)
                    .website(website)
                    .photoUrls(photos)
                    .openingHours(openingHours)
                    .reviews(reviews)
                    .build();

        } catch (Exception e) {
            log.error("Google Places API 호출 실패", e);
            throw new RuntimeException("매장 정보를 불러오는데 실패했습니다.");
        }
    }

    private List<String> extractPhotos(JsonNode photoNodes) {
        if (photoNodes == null || !photoNodes.isArray()) return Collections.emptyList();
        return StreamSupport.stream(photoNodes.spliterator(), false)
                .map(photo -> buildPhotoUrl(photo.path("photo_reference").asText()))
                .collect(Collectors.toList());
    }

    private List<String> extractArray(JsonNode node) {
        if (node == null || !node.isArray()) return Collections.emptyList();
        return StreamSupport.stream(node.spliterator(), false)
                .map(JsonNode::asText)
                .collect(Collectors.toList());
    }

    private List<ReviewWithPhotosDto> combineReviewsAndPhotos(JsonNode reviewsNode, JsonNode photoNodes) {
        if (reviewsNode == null || !reviewsNode.isArray()) {
            return Collections.emptyList();
        }

        Map<String, List<String>> photosByAuthor = new HashMap<>();
        if (photoNodes != null && photoNodes.isArray()) {
            Pattern pattern = Pattern.compile(">(.+?)<");

            StreamSupport.stream(photoNodes.spliterator(), false).forEach(photo -> {
                String authorName = "Unknown";
                JsonNode attributionNode = photo.path("html_attributions").path(0);
                if (attributionNode != null && !attributionNode.isMissingNode()) {
                    Matcher matcher = pattern.matcher(attributionNode.asText());
                    if (matcher.find()) {
                        authorName = matcher.group(1);
                    }
                }
                String photoUrl = buildPhotoUrl(photo.path("photo_reference").asText());
                photosByAuthor.computeIfAbsent(authorName, k -> new ArrayList<>()).add(photoUrl);
            });
        }

        return StreamSupport.stream(reviewsNode.spliterator(), false)
                .limit(5)
                .map(review -> {
                    String authorName = review.path("author_name").asText();
                    double reviewRating = review.path("rating").asDouble();
                    String text = review.path("text").asText();
                    List<String> userPhotos = photosByAuthor.getOrDefault(authorName, Collections.emptyList());

                    return ReviewWithPhotosDto.builder()
                            .authorName(authorName)
                            .text(text)
                            .rating(reviewRating)
                            .photoUrls(userPhotos)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String buildPhotoUrl(String photoReference) {
        return String.format(
                "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=%s&key=%s",
                photoReference, apiKey
        );
    }
}
