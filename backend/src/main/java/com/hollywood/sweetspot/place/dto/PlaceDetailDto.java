package com.hollywood.sweetspot.place.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class PlaceDetailDto {
    private String name;
    private String address;
    private double lat;
    private double lng;
    private Double rating;
    private String website;
    private List<String> photoUrls; // 장소의 대표 사진 목록
    private List<String> openingHours;
    private List<ReviewWithPhotosDto> reviews; // ✅ 리뷰 타입을 변경
}
