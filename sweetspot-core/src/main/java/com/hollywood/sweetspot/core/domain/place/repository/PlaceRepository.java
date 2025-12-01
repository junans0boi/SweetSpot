package com.hollywood.sweetspot.core.domain.place.repository;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import com.hollywood.sweetspot.core.domain.review.entity.Review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Stream;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long>, JpaSpecificationExecutor<Place> {

    // ✅ [수정됨] ::geography 충돌 방지를 위해 CAST(... AS geography) 표준 문법 사용
    @Query(value = "SELECT * FROM places p " +
            "WHERE ST_DWithin(p.geom, CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography), :radius) " +
            "ORDER BY ST_Distance(p.geom, CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography))", nativeQuery = true)
    List<Place> findNearbyPlaces(@Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius);

    // --- 아래는 기존 코드 유지 ---
    @Query("SELECT DISTINCT p.mainCategory FROM Place p ORDER BY p.mainCategory ASC")
    List<String> findDistinctMainCategories();

    @Query(value = "SELECT p FROM Place p WHERE p.geom IS NULL AND p.epsg5174x IS NULL", countQuery = "SELECT COUNT(p) FROM Place p WHERE p.geom IS NULL AND p.epsg5174x IS NULL")
    Page<Place> findByGeomIsNullAndEpsg5174xIsNull(Pageable pageable);

    @Query("SELECT p.mainCategory, COUNT(p) FROM Place p GROUP BY p.mainCategory")
    List<Object[]> findMainCategoryFrequency();

    @Query("SELECT p.subCategory, COUNT(p) FROM Place p GROUP BY p.subCategory")
    List<Object[]> findSubCategoryFrequency();

    @Query("SELECT name FROM Place")
    Stream<String> streamAllNames();

    @Query("SELECT name FROM Place p WHERE p.mainCategory = :mainCategory")
    Stream<String> streamNamesByMainCategory(String mainCategory);

    boolean existsByGooglePlaceId(String googlePlaceId);

    // ✅ [추가] 이름 또는 주소로 검색 (대소문자 무시)
    // PostgreSQL의 경우 ILIKE를 쓰거나 lower() 함수 사용 가능.
    // JPA 메서드 네이밍 쿼리가 가장 편함.
    Page<Place> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address,
            Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.place.id = :placeId")
    Double getAverageRatingByPlaceId(@Param("placeId") Long placeId);
    

}