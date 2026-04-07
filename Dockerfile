# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사 (캐싱 최적화)
COPY package*.json ./

# devDependencies 포함 설치 (TypeScript 빌드에 필요)
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:22-alpine

# 비루트 사용자 생성 (보안: 컨테이너 탈출 시 호스트 root 권한 방지)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# production 의존성만 설치
RUN npm ci --omit=dev

# 빌드 산출물만 복사 — --chown으로 소유권을 바로 지정해 별도 chown 레이어 불필요
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# 비루트 사용자로 전환 후 config 디렉토리 생성 (appuser 소유권 보장)
USER appuser
RUN mkdir -p /app/config

# 포트 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["node", "dist/main"]
