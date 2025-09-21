# STAGE 1: Build the application JAR
# 🔻 수정됨: 보다 안정적인 eclipse-temurin JDK 이미지 사용
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# build.gradle 파일 먼저 복사하여 종속성 캐싱 활용
COPY build.gradle settings.gradle /app/
COPY gradlew /app/
COPY gradle /app/gradle/

# gradle wrapper 실행 권한 부여
RUN chmod +x ./gradlew

# 종속성 다운로드 (소스코드 변경 없이 종속성만 변경되었을 때 빌드 시간 단축)
RUN ./gradlew dependencies

# 소스코드 복사
COPY src /app/src

# Gradle을 사용하여 애플리케이션 빌드
RUN ./gradlew bootJar

# STAGE 2: Create the final lean image
# 🔻 수정됨: JRE 역시 eclipse-temurin 이미지 사용
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# builder 스테이지에서 빌드된 JAR 파일만 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 애플리케이션 실행 포트 노출
EXPOSE 8080

# 컨테이너 시작 시 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
