/**
 * @fileoverview 주문 Query 리포지토리 인터페이스
 *
 * 읽기(Read) 전용 작업을 정의합니다.
 * 이 인터페이스는 도메인 계층에 위치하며, 구현체는 인프라 계층에 존재합니다.
 * 도메인은 구현 기술(TypeORM, 등)에 의존하지 않습니다.
 */

import { Order, OrderStatus } from '../order.entity.js';

/**
 * 주문 조회 전용 리포지토리 인터페이스
 *
 * CQRS 패턴에서 Query 측 계약을 정의합니다.
 * 구현체는 {@link ORDER_QUERY_REPOSITORY} 토큰으로 NestJS DI에 등록됩니다.
 */
export interface IOrderQueryRepository {
    /**
     * ID로 단일 주문을 조회합니다.
     *
     * @param id - 조회할 주문의 UUID
     * @returns 주문 엔티티 또는 존재하지 않으면 null
     */
    findById(id: string): Promise<Order | null>;

    /**
     * 모든 주문을 조회합니다.
     *
     * @returns 주문 엔티티 배열 (없으면 빈 배열)
     */
    findAll(): Promise<Order[]>;

    /**
     * 특정 상태의 주문 목록을 조회합니다.
     *
     * @param status - 필터링할 주문 상태
     * @returns 해당 상태의 주문 엔티티 배열
     */
    findByStatus(status: OrderStatus): Promise<Order[]>;

    /**
     * 주문 목록을 페이지네이션으로 조회합니다.
     *
     * @param page - 페이지 번호 (1부터 시작)
     * @param limit - 페이지당 항목 수
     * @param status - (선택) 주문 상태 필터
     * @returns [주문 엔티티 배열, 전체 항목 수]
     */
    findPaginated(page: number, limit: number, status?: OrderStatus): Promise<[Order[], number]>;
}
