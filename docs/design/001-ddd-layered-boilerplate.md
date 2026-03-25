# 001 DDD 레이어드 아키텍처 보일러플레이트 초기화

## Context
- 기존 copyright 탐지 프로젝트를 기반으로 새 프로젝트(orderbook-backend)를 초기화
- 기존 도메인 코드(copyright, entities)는 삭제하고 유틸리티(kafka, s3, sse, config)는 유지
- DDD + 레이어드 아키텍처 패턴을 적용한 보일러플레이트 구성

## Goals
- G1: 기존 유틸리티 모듈(kafka, s3, sse, config) 유지
- G2: DDD 기반 레이어드 아키텍처 적용 (Presentation → Application → Domain ← Infrastructure)
- G3: 도메인 로직은 Domain Entity에만 위치, Service는 도메인 메서드 호출만 담당
- G4: Query/Command Repository 인터페이스(도메인 계층)와 구현체(인프라 계층) 분리
- G5: 샘플 도메인(`Order`)으로 패턴 시연

## Non-goals
- NG1: 실제 비즈니스 로직 구현 (샘플 수준만)
- NG2: Kafka/S3 연동 샘플 (기존 유틸리티 재사용 패턴은 별도 설계 필요)

## Current State
- 기존 도메인: CopyrightImage, DetectionMatch (copyright 탐지 도메인)
- 아키텍처: 단일 계층 (entity + service + controller 혼재)
- 유틸리티: kafka, s3, sse, config (재사용 가능)

## Proposal (High-level)
- 기존 copyright 모듈과 entities 폴더 삭제
- `src/sample/` 하위에 DDD 레이어드 구조로 Order 샘플 도메인 생성
- TypeORM ORM 엔티티와 도메인 엔티티 분리

## Detailed Design

### 디렉토리 구조
```
src/
├── main.ts
├── app.module.ts
├── config/
├── kafka/         (유지 - 유틸리티)
├── s3/            (유지 - 유틸리티)
├── sse/           (유지 - 유틸리티)
├── constants/
│   └── sse.constant.ts  (유지)
└── sample/
    ├── sample.module.ts
    ├── domain/                              ← 도메인 계층
    │   ├── order.entity.ts                  ← 리치 도메인 엔티티 (비즈니스 로직)
    │   └── repository/
    │       ├── order-query.repository.ts    ← Query 리포지토리 인터페이스
    │       └── order-command.repository.ts  ← Command 리포지토리 인터페이스
    ├── infrastructure/                      ← 인프라 계층
    │   ├── persistence/
    │   │   └── order.orm-entity.ts          ← TypeORM ORM 엔티티
    │   └── repository/
    │       ├── order-query.repository.impl.ts
    │       └── order-command.repository.impl.ts
    ├── application/                         ← 애플리케이션 계층
    │   └── order.service.ts                 ← 유스케이스 오케스트레이션만
    └── presentation/                        ← 프레젠테이션 계층
        ├── order.controller.ts
        └── dto/
            ├── create-order.dto.ts
            └── order-response.dto.ts
```

### 레이어 의존성 규칙
- Presentation → Application → Domain ← Infrastructure
- Domain은 어떤 계층도 의존하지 않음
- Infrastructure는 Domain 인터페이스를 구현

### Data / Model

#### Order 도메인 엔티티
- id: string (UUID)
- title: string
- status: OrderStatus (PENDING → PLACED → COMPLETED | CANCELLED)
- quantity: number
- price: number
- createdAt: Date
- updatedAt: Date

#### OrderStatus 흐름
```
PENDING → place() → PLACED → complete() → COMPLETED
PENDING → cancel() → CANCELLED
PLACED  → cancel() → CANCELLED
```

### APIs / Interfaces

#### IOrderQueryRepository
```typescript
findById(id: string): Promise<Order | null>
findAll(): Promise<Order[]>
findByStatus(status: OrderStatus): Promise<Order[]>
```

#### IOrderCommandRepository
```typescript
save(order: Order): Promise<Order>
update(order: Order): Promise<Order>
delete(id: string): Promise<void>
```

#### OrderController
- POST `/orders` - 주문 생성
- GET `/orders` - 주문 목록 조회
- GET `/orders/:id` - 주문 상세 조회
- PATCH `/orders/:id/place` - 주문 접수
- PATCH `/orders/:id/complete` - 주문 완료
- PATCH `/orders/:id/cancel` - 주문 취소
- DELETE `/orders/:id` - 주문 삭제

## Risks & Trade-offs
- Risk: ORM 엔티티와 도메인 엔티티 분리로 매핑 코드 증가
  - Mitigation: 보일러플레이트에서 명확한 매퍼 패턴 제시
- Risk: TypeORM autoload 패턴이 도메인 엔티티를 잘못 인식할 수 있음
  - Mitigation: ORM 엔티티는 `.orm-entity.ts` 접미사, autoload 패턴 변경

## Test / Verification Plan
- 빌드: `npm run build`
- 린트: `npm run lint`
- 수동: Swagger UI에서 CRUD 플로우 확인

## TODO
- [x] 기존 copyright 모듈 삭제
- [x] 기존 entities 폴더 삭제
- [x] 기존 constants(image, vendor) 삭제
- [x] Order 도메인 엔티티 생성
- [x] Query/Command 리포지토리 인터페이스 생성
- [x] ORM 엔티티 생성
- [x] 리포지토리 구현체 생성
- [x] OrderService 생성
- [x] OrderController + DTO 생성
- [x] SampleModule 생성
- [x] AppModule 업데이트
- [x] tsconfig paths 업데이트
- [x] docs/architecture.md 생성
- [x] docs/conventions.md 생성
