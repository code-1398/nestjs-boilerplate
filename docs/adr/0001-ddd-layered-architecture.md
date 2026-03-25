# ADR 0001: DDD 레이어드 아키텍처 채택

## Status
Accepted

## Context
기존 프로젝트는 단일 계층 구조(entity + service + controller 혼재)로 도메인 로직이
서비스에 분산되어 있었습니다. 새 프로젝트 초기화 시점에 아키텍처 패턴을 정립합니다.

## Decision
- **DDD 레이어드 아키텍처** 채택: Presentation → Application → Domain ← Infrastructure
- 도메인 로직은 Domain Entity 에만 위치 (Rich Domain Model)
- Repository 인터페이스는 Domain 계층, 구현체는 Infrastructure 계층
- TypeORM ORM 엔티티와 도메인 엔티티 분리 (Mapper 패턴)

## Alternatives
- A: 단순 MVC (Controller → Service → Repository): 간단하지만 도메인 로직이 서비스에 집중됨
- B: Hexagonal Architecture: 포트/어댑터 명시적 분리, 더 엄격하지만 복잡도 증가
- C: CQRS + Event Sourcing: 고도화된 패턴, 현재 요구사항에는 과도함

## Consequences
- pros:
  - 도메인 로직이 한 곳에 집중 → 테스트 용이
  - 인프라 변경(DB 교체 등) 시 도메인 영향 없음
  - 코드 구조가 비즈니스 개념을 명확하게 반영
- cons:
  - ORM 엔티티 ↔ 도메인 엔티티 매핑 코드 추가 필요
  - 초기 파일 수 증가 (인터페이스, 구현체, 매퍼 분리)
- follow-ups:
  - [ ] 도메인 이벤트(Domain Event) 패턴 도입 검토
  - [ ] CQRS 읽기 모델 분리 검토 (조회 성능 최적화 필요 시)
