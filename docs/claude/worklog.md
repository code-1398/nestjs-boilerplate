# Worklog

## 2026-03-17 — DDD 레이어드 아키텍처 보일러플레이트 초기화

- Request:
  - 기존 copyright 탐지 프로젝트 기반으로 orderbook-backend 신규 보일러플레이트 생성
  - 유틸리티 모듈(kafka, s3, sse, config) 유지, 기존 도메인 코드 삭제
  - DDD + 레이어드 아키텍처 + Query/Command 리포지토리 인터페이스 패턴 적용
  - 모든 JSDoc 주석 한국어로 작성
- Outcome: Done
- Decisions/Assumptions:
  - 샘플 도메인으로 `Order` 선택 (프로젝트명 orderbook과 일치)
  - TypeORM ORM 엔티티 파일명은 `.orm-entity.ts` 접미사로 도메인 엔티티와 구분
  - AppModule의 entity autoload 패턴을 `*.orm-entity{.ts,.js}`로 변경
  - DI 토큰은 Symbol로 정의 (`sample.tokens.ts`)
  - `uuid` 패키지 이미 설치되어 있어 별도 추가 불필요
- Files changed:
  - 삭제: src/entities/, src/copyright/, src/constants/image.constant.ts, src/constants/vendor.constant.ts
  - 수정: src/app.module.ts, src/main.ts, tsconfig.json
  - 생성: src/sample/ (전체 도메인 모듈)
  - 생성: docs/architecture.md, docs/conventions.md, docs/adr/0001-ddd-layered-architecture.md
  - 생성: docs/design/001-ddd-layered-boilerplate.md, docs/claude/requests.md
- Commands/tests run:
  - `npm run build` (검증 예정)
- Follow-ups:
  - [ ] `npm run build` 빌드 성공 확인
  - [ ] Swagger UI에서 /orders CRUD 플로우 수동 검증
  - [ ] 도메인 이벤트(Domain Event) 패턴 도입 검토
