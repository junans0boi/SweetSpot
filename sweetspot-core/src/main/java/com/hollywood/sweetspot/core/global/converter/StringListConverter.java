package com.hollywood.sweetspot.core.global.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * List<String>을 DB의 String 배열(PostgreSQL text[])로 변환하는 컨버터
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    private static final String SPLIT_CHAR = "||"; // 배열 요소를 구분할 문자열 (파이프 기호 2개)

    // List -> DB (String)
    @Override
    public String convertToDatabaseColumn(List<String> stringList) {
        if (stringList == null || stringList.isEmpty()) {
            return null;
        }
        // null이거나 빈 문자열인 요소를 제거하고 SPLIT_CHAR로 연결
        return stringList.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .collect(Collectors.joining(SPLIT_CHAR));
    }

    // DB (String) -> List
    @Override
    public List<String> convertToEntityAttribute(String string) {
        if (string == null || string.trim().isEmpty()) {
            return Collections.emptyList();
        }
        // SPLIT_CHAR를 기준으로 분리하여 리스트로 변환
        return Arrays.stream(string.split(SPLIT_CHAR))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}