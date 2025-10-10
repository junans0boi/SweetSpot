# --- STAGE 1: Build React Native Web app ---
FROM node:20-alpine AS builder
WORKDIR /app

# package.json 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 복사
COPY ../frontend_Bak .

# Expo 기반 웹 빌드 (정적 HTML 생성)
RUN npx expo export --platform web

# --- STAGE 2: Serve with nginx ---
FROM nginx:stable-alpine

# Expo의 빌드 결과물(dist) 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]