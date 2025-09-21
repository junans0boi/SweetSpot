package com.hollywood.sweetspot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class SweetspotApplication {

	public static void main(String[] args) {
		SpringApplication.run(SweetspotApplication.class, args);
	}

}

// 🔻 테스트를 위해 추가된 컨트롤러
@RestController
class TestController {
	@GetMapping("/api/test")
	public String test() {
		return "SweetSpot API Server is running!";
	}
}
