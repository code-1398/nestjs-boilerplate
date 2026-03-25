/**
 * @fileoverview 주문 Command 리포지토리 TypeORM 구현체
 *
 * {@link IOrderCommandRepository} 인터페이스의 TypeORM 기반 구현입니다.
 * {@link Order} 엔티티가 도메인 객체와 ORM 엔티티 역할을 겸하므로 별도 변환이 불필요합니다.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../domain/order.entity.js';
import { IOrderCommandRepository } from '../../domain/repository/order-command.repository.js';

/**
 * 주문 쓰기 리포지토리 TypeORM 구현체
 *
 * NestJS DI 컨테이너에서 {@link ORDER_COMMAND_REPOSITORY} 토큰으로 바인딩됩니다.
 * 외부에서는 인터페이스 타입으로만 참조해야 합니다.
 */
@Injectable()
export class OrderCommandRepositoryImpl implements IOrderCommandRepository {
    /**
     * @param orderRepository - TypeORM 기본 리포지토리 (DI 주입)
     */
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    /**
     * 새 주문을 데이터베이스에 저장합니다.
     *
     * @param order - 저장할 주문 엔티티
     * @returns 저장 완료된 주문 엔티티
     */
    async save(order: Order): Promise<Order> {
        return this.orderRepository.save(order);
    }

    /**
     * 기존 주문의 변경 사항을 데이터베이스에 반영합니다.
     *
     * @param order - 업데이트할 주문 엔티티
     * @returns 업데이트 완료된 주문 엔티티
     */
    async update(order: Order): Promise<Order> {
        return this.orderRepository.save(order);
    }

    /**
     * ID에 해당하는 주문을 데이터베이스에서 삭제합니다.
     *
     * @param id - 삭제할 주문의 UUID
     */
    async delete(id: string): Promise<void> {
        await this.orderRepository.delete(id);
    }
}
