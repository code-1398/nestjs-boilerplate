# ADR 0006: 도메인 엔티티와 TypeORM 데코레이터 동일 클래스 적용

## Status
Accepted

## Context
ADR 0001에서 "TypeORM ORM 엔티티와 도메인 엔티티 분리 (Mapper 패턴)"을 채택했으나,
보일러플레이트 구현 과정에서 실제 코드는 도메인 엔티티에 TypeORM 데코레이터를
직접 적용하는 방식으로 작성되었습니다.

1차 코드 리뷰에서 문서와 구현의 불일치가 지적되었고, 두 방향을 검토했습니다.
- A: 현재 구현 유지 + 문서를 실제 구조에 맞게 수정
- B: Mapper 패턴으로 코드를 분리 (ORM 엔티티 + 도메인 엔티티 + Mapper 클래스)

## Decision
**A안 채택**: 도메인 엔티티에 TypeORM 데코레이터를 직접 적용하는 방식을 공식 패턴으로 확정합니다.

- 도메인 엔티티 파일(`.entity.ts`)에 TypeORM 데코레이터(`@Entity`, `@Column` 등) 직접 적용
- 별도 ORM 엔티티 파일(`.orm-entity.ts`)과 Mapper 클래스 미사용

## Alternatives
- **Mapper 패턴 (ADR 0001 원안)**: `domain/order.entity.ts` (순수 도메인) + `infrastructure/persistence/order.orm-entity.ts` (TypeORM 전용) + `order.mapper.ts` (변환 로직)
  - 장점: 도메인 계층이 ORM에 완전 독립, DB 교체 시 도메인 코드 무변경
  - 단점: 파일 수 증가(엔티티당 3개), 매핑 코드 유지 비용, 보일러플레이트에서 복잡도 과도

## Consequences
- pros:
  - 파일 구조 단순화 (엔티티당 1개 파일)
  - 매핑 코드 불필요 → 유지 비용 감소
  - 빠른 도메인 모듈 추가 가능
- cons:
  - 도메인 계층이 TypeORM에 직접 의존 (DB 교체 시 도메인 코드 수정 필요)
  - DDD 순수성 측면에서 타협
- follow-ups:
  - [ ] 대규모 프로젝트 전환 시 Mapper 패턴 재검토
