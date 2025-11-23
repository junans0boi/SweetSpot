package com.hollywood.sweetspot.core.domain.place.repository;

import com.hollywood.sweetspot.core.domain.place.entity.Place;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Stream;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long>, JpaSpecificationExecutor<Place> {

    // --- 공통 ---
    @Query("SELECT DISTINCT p.mainCategory FROM Place p ORDER BY p.mainCategory ASC")
    List<String> findDistinctMainCategories();

    // --- Admin 전용 (지오코딩) ---
    @Query(value = "SELECT p FROM Place p WHERE p.geom IS NULL AND p.epsg5174x IS NULL",
           countQuery = "SELECT COUNT(p) FROM Place p WHERE p.geom IS NULL AND p.epsg5174x IS NULL")
    Page<Place> findByGeomIsNullAndEpsg5174xIsNull(Pageable pageable);

    // --- Admin 전용 (통계) ---
    @Query("SELECT p.mainCategory, COUNT(p) FROM Place p GROUP BY p.mainCategory")
    List<Object[]> findMainCategoryFrequency();

    @Query("SELECT p.subCategory, COUNT(p) FROM Place p GROUP BY p.subCategory")
    List<Object[]> findSubCategoryFrequency();

    @Query("SELECT name FROM Place")
    Stream<String> streamAllNames();

    @Query("SELECT name FROM Place p WHERE p.mainCategory = :mainCategory")
    Stream<String> streamNamesByMainCategory(String mainCategory);
}