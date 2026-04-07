# Conventions

## Project Structure
```
src/
├── config/          - 환경 설정 (Zod 스키마 검증)
├── constants/       - 전역 상수 및 열거형
├── kafka/           - Kafka 유틸리티 모듈 (global)
├── s3/              - S3 유틸리티 모듈 (global)
├── sse/             - SSE 유틸리티 모듈 (global)
└── <domain>/        - 도메인 모듈 (DDD 레이어드 구조)
    ├── domain/
    │   ├── <name>.entity.ts              - 리치 도메인 엔티티 (비즈니스 로직 + TypeORM 데코레이터)
    │   └── repository/
    │       ├── <name>-query.repository.ts     - 조회 인터페이스
    │       └── <name>-command.repository.ts   - 쓰기 인터페이스
    ├── infrastructure/
    │   └── repository/
    │       ├── <name>-query.repository.impl.ts
    │       └── <name>-command.repository.impl.ts
    ├── application/
    │   └── <name>.service.ts             - 유스케이스 오케스트레이션
    ├── presentation/
    │   ├── <name>.controller.ts
    │   └── dto/
    │       ├── create-<name>.dto.ts
    │       └── <name>-response.dto.ts
    ├── <domain>.module.ts
    └── <domain>.tokens.ts                - DI 토큰 (Symbol)
```

## Naming
- **파일**: `kebab-case.ts` (예: `order-query.repository.ts`)
- **도메인 엔티티 파일**: `.entity.ts` 접미사 사용 (TypeORM 데코레이터 포함)
- **클래스**: `PascalCase`
- **인터페이스**: `I` 접두사 + `PascalCase` (예: `IOrderQueryRepository`)
- **DI 토큰**: `UPPER_SNAKE_CASE` Symbol (예: `ORDER_QUERY_REPOSITORY`)
- **변수/함수**: `camelCase`
- **열거형 값**: `UPPER_SNAKE_CASE`

## Architecture Rules
- 도메인 엔티티에만 비즈니스 로직 작성 (서비스에서 직접 상태 변경 금지)
- 서비스는 도메인 메서드 호출 → 리포지토리 저장만 담당
- 도메인 계층은 인프라에 의존하지 않음 (인터페이스만 정의)
- 구현체 바인딩은 Module의 providers에서만 수행
- Controller는 DTO 변환과 서비스 위임만 담당

## Error Handling
- 도메인 규칙 위반: `throw new DomainException('메시지')` (도메인 엔티티에서) → `DomainExceptionFilter`가 400으로 매핑
- 리소스 없음: `throw new NotFoundException(...)` (서비스에서)
- 유효성 검증: `class-validator` 데코레이터 (DTO에서)

## Logging
- 로그 대상: 요청/응답, 주요 상태 전이, 오류
- 로그 금지: 비밀번호, API 키, 개인정보(PII), 토큰

## Testing
- 단위 테스트: 도메인 엔티티 메서드 (외부 의존 없음)
- 통합 테스트: 리포지토리 구현체 (실제 DB 사용, mock 금지)
- E2E 테스트: Controller → Service → DB 전체 흐름

## Git & PR
- 브랜치: `feat/*`, `fix/*`, `chore/*`
- 커밋: `<type>: <요약>` (예: `feat: 주문 상태 전이 로직 추가`)

## Comments
- JSDoc 형식, 한국어로 작성
- `@param`, `@returns`, `@throws` 태그 사용
- 자명한 코드에는 주석 불필요
