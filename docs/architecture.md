# Architecture

## Overview
- NestJS 기반 RESTful API 서버
- DDD + 레이어드 아키텍처 (Presentation → Application → Domain ← Infrastructure)
- 도메인 로직은 Domain Entity에만 위치, Service는 오케스트레이션만 담당
- 도메인 엔티티에 TypeORM 데코레이터 직접 적용 (Active Record 스타일, Mapper 패턴 미사용)
- Kafka(비동기 메시징), S3(파일 저장), SSE(실시간 이벤트) 유틸리티 모듈 제공

## Components

### 레이어 구조 (도메인 모듈 내부)
```
Presentation Layer  - Controller, DTO (요청/응답 직렬화)
Application Layer   - Service (유스케이스 오케스트레이션)
Domain Layer        - Entity (비즈니스 로직 + TypeORM 데코레이터), Repository 인터페이스
Infrastructure Layer - Repository 구현체
```

### 전역 유틸리티 모듈 (src/)
- **KafkaModule** (`src/kafka/`): Kafka 프로듀서/컨슈머, 토픽 발행·구독
- **S3Module** (`src/s3/`): AWS S3 파일 업로드·삭제
- **SseModule** (`src/sse/`): Server-Sent Events 클라이언트 관리 및 브로드캐스트

### 도메인 모듈 구조 (`src/`)
신규 도메인은 `src/<domain>/` 하위에 DDD 레이어드 구조로 추가.

**OrderBook 도메인 목록 (구현 예정)**
| 모듈 | URL prefix | 핵심 엔티티 |
|------|-----------|------------|
| accounts | /accounts/ | Customer, FCMDevice |
| stores | /stores/ | Store, Correspondent, StoreAlert |
| products | /products/ | Product, ProductCategory |
| cart | /cart/ | CartItem |
| orders | /orders/ | Order, OrderItem, Coupon |
| notifications | /notifications/ | FCMDevice |
| useai | /useai/ | (외부 AI API 래핑) |

**주문 상태 기계:**
```
CREATED → CONFIRMED → SHIPPED → DELIVERED
                ↕ (언제든)
             CANCELLED
```

## Data Flow
- Inbound: HTTP 요청 → Controller → Service → Domain Entity
- Processing: Domain Entity에서 비즈니스 규칙 적용
- Storage: Repository 구현체 → TypeORM → PostgreSQL
- Outbound: Domain Entity → DTO → HTTP 응답

## Key Dependencies
- DB: PostgreSQL (TypeORM, `synchronize: dev`만 활성화)
- Cache: 없음
- Queue: Kafka (kafkajs, SASL 인증)
- External APIs:
  - AWS S3 (`@aws-sdk/client-s3`) — 이미지 업로드
  - Popbill — 사업자 정보/검증
  - Naver Maps Geocoding API — 주소 좌표 변환
  - Firebase FCM — 푸시 알림
  - 외부 AI API — OCR, 채팅 (useai 모듈)

## Operational Notes
- Observability: 기본 NestJS 로그 (추후 Winston/OpenTelemetry 추가 예정)
- Deployment: Dockerfile 포함 (Node.js 기반)
- Scaling: 수평 확장 가능 (상태 없는 HTTP 서버)
- Swagger: `/api` 경로에서 API 문서 제공

## ADRs
- [ADR 001](adr/0001-ddd-layered-architecture.md): DDD 레이어드 아키텍처 채택
- [ADR 006](adr/0006-domain-entity-typeorm-colocation.md): 도메인 엔티티와 TypeORM 데코레이터 동일 클래스 적용 (Mapper 패턴 번복)
- [ADR 002](adr/0002-jwt-token-prefix-auth.md): JWT + 'Token' prefix 인증 방식
- [ADR 003](adr/0003-customer-unified-model.md): Customer 통합 모델 (BUYER/SELLER)
- [ADR 004](adr/0004-correspondent-nm-relation.md): Correspondent N:M 관계 설계
- [ADR 005](adr/0005-stores-products-endpoint.md): /stores/{id}/products/ correspondentId 해석
