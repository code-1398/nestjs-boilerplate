# Node.js 22 Alpine 이미지 사용
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (캐싱 최적화)
COPY package*.json ./

# 의존성 설치 (dev dependencies 포함 - 빌드를 위해 필요)
RUN npm ci

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# config.json 파일을 위한 디렉토리 생성
RUN mkdir -p /app/config

# 포트 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["npm", "run", "start:prod"]