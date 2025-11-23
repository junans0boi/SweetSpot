package com.hollywood.sweetspotadmin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
// ✅ [핵심 수정] admin 패키지와 core 패키지를 모두 스캔하도록 명시
@SpringBootApplication(scanBasePackages = {
    "com.hollywood.sweetspotadmin",      // Admin 모듈 (Controller, Service 등)
    "com.hollywood.sweetspot.core"       // Core 모듈 (Repository, Entity, Config 등)
})
public class SweetspotAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(SweetspotAdminApplication.class, args);
    }
}