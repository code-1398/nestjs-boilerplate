# Architecture

## Overview
- NestJS 기반 RESTful API 서버
- DDD + 레이어드 아키텍처 (Presentation → Application → Domain ← Infrastructure)
- 도메인 로직은 Domain Entity에만 위치, Service는 오케스트레이션만 담당
- TypeORM ORM 엔티티와 도메인 엔티티 분리 (Mapper 패턴)
- Kafka(비동기 메시징), S3(파일 저장), SSE(실시간 이벤트) 유틸리티 모듈 제공

## Components

### 레이어 구조 (도메인 모듈 내부)
```
Presentation Layer  - Controller, DTO (요청/응답 직렬화)
Application Layer   - Service (유스케이스 오케스트레이션)
Domain Layer        - Entity (비즈니스 로직), Repository 인터페이스
Infrastructure Layer - ORM Entity, Repository 구현체, Mapper
```

### 전역 유틸리티 모듈 (src/)
- **KafkaModule** (`src/kafka/`): Kafka 프로듀서/컨슈머, 토픽 발행·구독
- **S3Module** (`src/s3/`): AWS S3 파일 업로드·삭제
- **SseModule** (`src/sse/`): Server-Sent Events 클라이언트 관리 및 브로드캐스트

### 샘플 도메인 모듈 (`src/sample/`)
- **Order 도메인**: CRUD + 상태 전이 (PENDING → PLACED → COMPLETED | CANCELLED)
- 새 도메인은 `src/<domain>/` 하위에 동일한 구조로 추가

## Data Flow
- Inbound: HTTP 요청 → Controller → Service → Domain Entity
- Processing: Domain Entity에서 비즈니스 규칙 적용
- Storage: Repository 구현체 → TypeORM → PostgreSQL
- Outbound: Domain Entity → DTO → HTTP 응답

## Key Dependencies
- DB: PostgreSQL (TypeORM, `synchronize: true`)
- Cache: 없음
- Queue: Kafka (kafkajs, SASL 인증)
- External APIs: AWS S3 (`@aws-sdk/client-s3`)

## Operational Notes
- Observability: 기본 NestJS 로그 (추후 Winston/OpenTelemetry 추가 예정)
- Deployment: Dockerfile 포함 (Node.js 기반)
- Scaling: 수평 확장 가능 (상태 없는 HTTP 서버)
- Swagger: `/api` 경로에서 API 문서 제공

## ADRs
- [ADR 001](adr/0001-ddd-layered-architecture.md): DDD 레이어드 아키텍처 채택
