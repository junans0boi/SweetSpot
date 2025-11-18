package com.hollywood.sweetspot.place.repository;

import com.hollywood.sweetspot.place.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaceRepository extends JpaRepository<Place, Long> {
}
