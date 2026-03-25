/**
 * @fileoverview 주문 애플리케이션 서비스
 *
 * 유스케이스를 오케스트레이션합니다.
 * 이 계층은 도메인 로직을 직접 구현하지 않으며,
 * 도메인 엔티티의 메서드를 호출하고 리포지토리를 통해 영속화합니다.
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from '../domain/order.entity.js';
import type { IOrderQueryRepository } from '../domain/repository/order-query.repository.js';
import type { IOrderCommandRepository } from '../domain/repository/order-command.repository.js';
import {
    ORDER_QUERY_REPOSITORY,
    ORDER_COMMAND_REPOSITORY,
} from '../order.tokens.js';

/**
 * 주문 유스케이스 서비스
 *
 * 각 메서드는 단일 유스케이스에 대응합니다.
 * 도메인 규칙 검증은 {@link Order} 도메인 엔티티에 위임합니다.
 */
@Injectable()
export class OrderService {
    /**
     * @param queryRepository - 주문 조회 리포지토리 (DI 토큰: ORDER_QUERY_REPOSITORY)
     * @param commandRepository - 주문 쓰기 리포지토리 (DI 토큰: ORDER_COMMAND_REPOSITORY)
     */
    constructor(
        @Inject(ORDER_QUERY_REPOSITORY)
        private readonly queryRepository: IOrderQueryRepository,
        @Inject(ORDER_COMMAND_REPOSITORY)
        private readonly commandRepository: IOrderCommandRepository,
    ) {}

    /**
     * 새 주문을 생성합니다.
     *
     * @param title - 주문 제목
     * @param quantity - 주문 수량
     * @param price - 주문 단가
     * @returns 생성된 주문 도메인 엔티티
     */
    async createOrder(title: string, quantity: number, price: number): Promise<Order> {
        const order = Order.create(uuidv4(), title, quantity, price);
        return this.commandRepository.save(order);
    }

    /**
     * 모든 주문을 조회합니다.
     *
     * @returns 주문 목록
     */
    async findAll(): Promise<Order[]> {
        return this.queryRepository.findAll();
    }

    /**
     * ID로 단일 주문을 조회합니다.
     *
     * @param id - 조회할 주문 ID
     * @returns 주문 도메인 엔티티
     * @throws {NotFoundException} 주문이 존재하지 않는 경우
     */
    async findById(id: string): Promise<Order> {
        const order = await this.queryRepository.findById(id);
        if (!order) {
            throw new NotFoundException(`주문을 찾을 수 없습니다. ID: ${id}`);
        }
        return order;
    }

    /**
     * 특정 상태의 주문 목록을 조회합니다.
     *
     * @param status - 필터링할 주문 상태
     * @returns 해당 상태의 주문 목록
     */
    async findByStatus(status: OrderStatus): Promise<Order[]> {
        return this.queryRepository.findByStatus(status);
    }

    /**
     * 주문을 접수(PLACED) 상태로 전환합니다.
     * 도메인 규칙(PENDING → PLACED)은 {@link Order.place}에서 검증합니다.
     *
     * @param id - 접수할 주문 ID
     * @returns 업데이트된 주문 도메인 엔티티
     * @throws {NotFoundException} 주문이 존재하지 않는 경우
     */
    async placeOrder(id: string): Promise<Order> {
        const order = await this.findById(id);
        order.place();
        return this.commandRepository.update(order);
    }

    /**
     * 주문을 완료(COMPLETED) 상태로 전환합니다.
     * 도메인 규칙(PLACED → COMPLETED)은 {@link Order.complete}에서 검증합니다.
     *
     * @param id - 완료 처리할 주문 ID
     * @returns 업데이트된 주문 도메인 엔티티
     * @throws {NotFoundException} 주문이 존재하지 않는 경우
     */
    async completeOrder(id: string): Promise<Order> {
        const order = await this.findById(id);
        order.complete();
        return this.commandRepository.update(order);
    }

    /**
     * 주문을 취소(CANCELLED) 상태로 전환합니다.
     * 도메인 규칙은 {@link Order.cancel}에서 검증합니다.
     *
     * @param id - 취소할 주문 ID
     * @returns 업데이트된 주문 도메인 엔티티
     * @throws {NotFoundException} 주문이 존재하지 않는 경우
     */
    async cancelOrder(id: string): Promise<Order> {
        const order = await this.findById(id);
        order.cancel();
        return this.commandRepository.update(order);
    }

    /**
     * 주문을 삭제합니다.
     *
     * @param id - 삭제할 주문 ID
     * @throws {NotFoundException} 주문이 존재하지 않는 경우
     */
    async deleteOrder(id: string): Promise<void> {
        await this.findById(id);
        await this.commandRepository.delete(id);
    }
}
