FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /app
# 루트의 설정 파일 복사
COPY build.gradle settings.gradle /app/
COPY gradlew /app/
COPY gradle /app/gradle/
# 각 모듈의 build.gradle 복사 (중요)
COPY sweetspot-core/build.gradle /app/sweetspot-core/
COPY sweetspot-api/build.gradle /app/sweetspot-api/
COPY sweetspot-admin/build.gradle /app/sweetspot-admin/

RUN chmod +x ./gradlew
# API 모듈만 빌드
COPY . /app
RUN ./gradlew :sweetspot-api:bootJar -x test

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# 빌드된 jar 경로 주의
COPY --from=builder /app/sweetspot-api/build/libs/*.jar app.jar
EXPOSE 5005
ENTRYPOINT ["java", "-jar", "app.jar"]