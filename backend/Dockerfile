# STAGE 1: Build the application JAR
FROM openjdk:21-jdk-slim AS builder

WORKDIR /app

COPY build.gradle settings.gradle /app/
COPY gradlew /app/
COPY gradle /app/gradle/

RUN chmod +x ./gradlew
RUN ./gradlew dependencies

COPY src /app/src
RUN ./gradlew bootJar

# STAGE 2: Create the final lean image
FROM openjdk:21-jre-slim

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]