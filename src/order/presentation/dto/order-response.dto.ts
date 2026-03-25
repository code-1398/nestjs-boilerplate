/**
 * @fileoverview 주문 응답 DTO
 *
 * 도메인 엔티티를 HTTP 응답으로 직렬화합니다.
 * 도메인 엔티티의 내부 구조를 외부에 노출하지 않습니다.
 */

import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '../../domain/order.entity.js';

/**
 * 주문 단건 응답 스키마
 */
export class OrderResponseDto {
    /**
     * 주문 고유 식별자 (UUID)
     * @example "550e8400-e29b-41d4-a716-446655440000"
     */
    @ApiProperty({ description: '주문 고유 식별자 (UUID)' })
    id: string;

    /**
     * 주문 제목
     * @example "갤럭시 S25 주문"
     */
    @ApiProperty({ description: '주문 제목' })
    title: string;

    /**
     * 현재 주문 상태
     * @example "PENDING"
     */
    @ApiProperty({ description: '주문 상태', enum: OrderStatus })
    status: OrderStatus;

    /**
     * 주문 수량
     * @example 2
     */
    @ApiProperty({ description: '주문 수량' })
    quantity: number;

    /**
     * 주문 단가
     * @example 1200000
     */
    @ApiProperty({ description: '주문 단가' })
    price: number;

    /**
     * 주문 총액 (수량 × 단가)
     * @example 2400000
     */
    @ApiProperty({ description: '주문 총액 (수량 × 단가)' })
    total: number;

    /**
     * 생성 일시
     */
    @ApiProperty({ description: '생성 일시' })
    createdAt: Date;

    /**
     * 마지막 수정 일시
     */
    @ApiProperty({ description: '마지막 수정 일시' })
    updatedAt: Date;

    /**
     * 도메인 엔티티를 응답 DTO로 변환합니다.
     *
     * @param order - 변환할 Order 도메인 엔티티
     * @returns OrderResponseDto 인스턴스
     */
    static fromDomain(order: Order): OrderResponseDto {
        const dto = new OrderResponseDto();
        dto.id = order.id;
        dto.title = order.title;
        dto.status = order.status;
        dto.quantity = order.quantity;
        dto.price = order.price;
        dto.total = order.calculateTotal();
        dto.createdAt = order.createdAt;
        dto.updatedAt = order.updatedAt;
        return dto;
    }
}
