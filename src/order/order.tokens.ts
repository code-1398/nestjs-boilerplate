/**
 * @fileoverview 주문 모듈 DI 토큰 정의
 *
 * NestJS 의존성 주입에서 인터페이스 바인딩에 사용하는 심볼 토큰입니다.
 * 서비스 계층에서 구현체가 아닌 인터페이스에 의존하도록 합니다.
 */

/**
 * 주문 조회 리포지토리 DI 토큰
 * {@link IOrderQueryRepository} 인터페이스 바인딩에 사용됩니다.
 */
export const ORDER_QUERY_REPOSITORY = Symbol('IOrderQueryRepository');

/**
 * 주문 쓰기 리포지토리 DI 토큰
 * {@link IOrderCommandRepository} 인터페이스 바인딩에 사용됩니다.
 */
export const ORDER_COMMAND_REPOSITORY = Symbol('IOrderCommandRepository');
