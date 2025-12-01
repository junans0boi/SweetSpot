package com.hollywood.sweetspot.place.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceDetailDto {
    private Long id; 
    private String name;
    private String address;
    private String mainCategory; 
    private String subCategory; 
    private double lat;
    private double lng;
    private Double rating;
    private String website;
    private List<String> photoUrls; // 장소의 대표 사진 목록
    private List<String> openingHours;
    private List<ReviewWithPhotosDto> reviews; // ✅ 리뷰 타입을 변경
    private List<String> tags;
}
