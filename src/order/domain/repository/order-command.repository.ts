/**
 * @fileoverview 주문 Command 리포지토리 인터페이스
 *
 * 쓰기(Write) 전용 작업을 정의합니다.
 * 이 인터페이스는 도메인 계층에 위치하며, 구현체는 인프라 계층에 존재합니다.
 * 도메인은 구현 기술(TypeORM 등)에 의존하지 않습니다.
 */

import { Order } from '../order.entity.js';

/**
 * 주문 쓰기 전용 리포지토리 인터페이스
 *
 * CQRS 패턴에서 Command 측 계약을 정의합니다.
 * 구현체는 {@link ORDER_COMMAND_REPOSITORY} 토큰으로 NestJS DI에 등록됩니다.
 */
export interface IOrderCommandRepository {
    /**
     * 새 주문을 저장합니다.
     *
     * @param order - 저장할 주문 도메인 엔티티
     * @returns 저장 완료된 주문 도메인 엔티티
     */
    save(order: Order): Promise<Order>;

    /**
     * 기존 주문의 변경된 상태를 반영합니다.
     *
     * @param order - 업데이트할 주문 도메인 엔티티 (id 필드 필수)
     * @returns 업데이트 완료된 주문 도메인 엔티티
     */
    update(order: Order): Promise<Order>;

    /**
     * ID로 주문을 삭제합니다.
     *
     * @param id - 삭제할 주문의 UUID
     * @returns 삭제 완료 시 void
     */
    delete(id: string): Promise<void>;
}
