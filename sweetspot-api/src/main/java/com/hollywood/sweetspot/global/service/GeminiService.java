package com.hollywood.sweetspot.global.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hollywood.sweetspot.core.domain.place.entity.Place;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // ✅ [수정] gemini-pro -> gemini-2.5-flash 로 변경
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, Object>> getRecommendations(List<Place> candidates, String userMood) {
        String aiText = ""; 
        try {
            // 1. 프롬프트 구성
            StringBuilder prompt = new StringBuilder();
            prompt.append("사용자 기분: '").append(userMood).append("'\n");
            prompt.append("후보 장소 목록:\n");
            
            for (int i = 0; i < candidates.size(); i++) {
                Place p = candidates.get(i);
                prompt.append(i + 1).append(". ").append(p.getName())
                      .append(" (").append(p.getSubCategory()).append(")\n");
            }

            prompt.append("\n위 후보 중 이 기분에 가장 잘 어울리는 **3곳**을 추천해줘.\n");
            // AI가 JSON만 뱉도록 강력하게 지시
            prompt.append("응답은 다른 말 없이 오직 아래와 같은 **JSON 배열** 형식으로만 줘:\n");
            prompt.append("[ { \"index\": 번호, \"reason\": \"추천이유\" }, { \"index\": 번호, \"reason\": \"추천이유\" }, ... ]");

            // 2. 요청 바디 생성
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(Map.of("text", prompt.toString())));
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(content));

            // 3. HTTP 요청
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // URL에 API 키 포함
            String url = GEMINI_URL + "?key=" + apiKey;
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            // 4. 응답 파싱
            JsonNode root = objectMapper.readTree(response.getBody());
            aiText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            System.out.println("🤖 AI Raw Response: " + aiText);

            // 5. JSON 배열 부분만 추출
            int jsonStart = aiText.indexOf("[");
            int jsonEnd = aiText.lastIndexOf("]");
            
            if (jsonStart != -1 && jsonEnd != -1) {
                String jsonArrayStr = aiText.substring(jsonStart, jsonEnd + 1);
                return objectMapper.readValue(jsonArrayStr, new TypeReference<List<Map<String, Object>>>() {});
            } else {
                throw new RuntimeException("AI 응답에서 JSON 배열을 찾을 수 없습니다.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ AI 파싱 에러 원문: " + aiText);
            
            // 에러 발생 시 Fallback (기본 추천 1개 리턴)
            List<Map<String, Object>> fallback = new ArrayList<>();
            fallback.add(Map.of("index", 1, "reason", "AI가 잠시 쉬고 있어요. 하지만 이곳도 훌륭해요!"));
            return fallback;
        }
    }
}