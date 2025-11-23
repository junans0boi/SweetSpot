package com.hollywood.sweetspot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// ✅ [핵심 수정] api 패키지와 core 패키지 모두 스캔
@SpringBootApplication(scanBasePackages = {
    "com.hollywood.sweetspot",           // API 모듈
    "com.hollywood.sweetspot.core"       // Core 모듈
})
public class SweetspotApplication {

    public static void main(String[] args) {
        SpringApplication.run(SweetspotApplication.class, args);
    }
}