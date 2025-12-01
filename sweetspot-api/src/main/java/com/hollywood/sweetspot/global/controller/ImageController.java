package com.hollywood.sweetspot.global.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    // 이미지를 저장할 로컬 경로 (Docker 컨테이너 내부 경로)
    private final String uploadDir = "/app/uploads/";

    // 외부에서 접근할 도메인 주소
    @Value("${front.base-url}")
    private String baseUrl;

    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadImages(@RequestParam("files") List<MultipartFile> files) {
        List<String> imageUrls = new ArrayList<>();

        // 디렉토리가 없으면 생성
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }

        for (MultipartFile file : files) {
            try {
                // 1. 유니크한 파일명 생성
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + fileName);

                // 2. 서버 디스크에 저장
                Files.write(filePath, file.getBytes());

                // 3. 접근 가능한 URL 생성 (예: https://sweetspot.kro.kr/api/images/view/filename.jpg)
                String fileUrl = baseUrl + "/api/images/view/" + fileName;
                imageUrls.add(fileUrl);

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().build();
            }
        }

        return ResponseEntity.ok(imageUrls);
    }

    // 이미지를 보여주는(서빙하는) GET 메서드
    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName) {
        try {
            Path file = Paths.get(uploadDir).resolve(fileName);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                // ✅ [수정] 파일 확장자에 따라 Content-Type 동적 설정
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType)) // 동적 타입 적용
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) { // MalformedURLException -> Exception으로 변경 (Files.probeContentType 예외 처리)
            return ResponseEntity.badRequest().build();
        }
    }
}