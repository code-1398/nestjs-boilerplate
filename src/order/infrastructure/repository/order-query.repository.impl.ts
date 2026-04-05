/**
 * @fileoverview 주문 Query 리포지토리 TypeORM 구현체
 *
 * {@link IOrderQueryRepository} 인터페이스의 TypeORM 기반 구현입니다.
 * {@link Order} 엔티티가 도메인 객체와 ORM 엔티티 역할을 겸하므로 별도 변환이 불필요합니다.
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../domain/order.entity.js';
import { IOrderQueryRepository } from '../../domain/repository/order-query.repository.js';

/**
 * 주문 조회 리포지토리 TypeORM 구현체
 *
 * NestJS DI 컨테이너에서 {@link ORDER_QUERY_REPOSITORY} 토큰으로 바인딩됩니다.
 * 외부에서는 인터페이스 타입으로만 참조해야 합니다.
 */
@Injectable()
export class OrderQueryRepositoryImpl implements IOrderQueryRepository {
    /**
     * @param orderRepository - TypeORM 기본 리포지토리 (DI 주입)
     */
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) {}

    /**
     * ID로 단일 주문을 조회합니다.
     *
     * @param id - 조회할 주문의 UUID
     * @returns 주문 엔티티 또는 존재하지 않으면 null
     */
    async findById(id: string): Promise<Order | null> {
        return this.orderRepository.findOneBy({ id });
    }

    /**
     * 모든 주문을 생성 일시 오름차순으로 조회합니다.
     *
     * @returns 주문 엔티티 배열
     */
    async findAll(): Promise<Order[]> {
        return this.orderRepository.find({ order: { createdAt: 'ASC' } });
    }

    /**
     * 특정 상태의 주문 목록을 조회합니다.
     *
     * @param status - 필터링할 주문 상태
     * @returns 해당 상태의 주문 엔티티 배열
     */
    async findByStatus(status: OrderStatus): Promise<Order[]> {
        return this.orderRepository.find({
            where: { status },
            order: { createdAt: 'ASC' },
        });
    }

    /**
     * 주문 목록을 페이지네이션으로 조회합니다.
     *
     * @param page - 페이지 번호 (1부터 시작)
     * @param limit - 페이지당 항목 수
     * @param status - (선택) 주문 상태 필터
     * @returns [주문 엔티티 배열, 전체 항목 수]
     */
    async findPaginated(
        page: number,
        limit: number,
        status?: OrderStatus,
    ): Promise<[Order[], number]> {
        return this.orderRepository.findAndCount({
            where: status ? { status } : undefined,
            order: { createdAt: 'ASC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
}
