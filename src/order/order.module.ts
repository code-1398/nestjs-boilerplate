/**
 * @fileoverview 주문 도메인 모듈
 *
 * DDD 레이어드 아키텍처 패턴의 참조 구현입니다.
 * 도메인 인터페이스와 인프라 구현체를 DI 토큰으로 바인딩합니다.
 *
 * 레이어 구조:
 * - Presentation: {@link OrderController}
 * - Application:  {@link OrderService}
 * - Domain:       {@link Order}, {@link IOrderQueryRepository}, {@link IOrderCommandRepository}
 * - Infrastructure: {@link OrderQueryRepositoryImpl}, {@link OrderCommandRepositoryImpl}
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './domain/order.entity.js';
import { OrderQueryRepositoryImpl } from './infrastructure/repository/order-query.repository.impl.js';
import { OrderCommandRepositoryImpl } from './infrastructure/repository/order-command.repository.impl.js';
import { OrderService } from './application/order.service.js';
import { OrderController } from './presentation/order.controller.js';
import { ORDER_QUERY_REPOSITORY, ORDER_COMMAND_REPOSITORY } from './order.tokens.js';

/**
 * 주문(Order) 도메인 모듈
 *
 * 리포지토리 인터페이스를 구현체에 바인딩:
 * - ORDER_QUERY_REPOSITORY → OrderQueryRepositoryImpl
 * - ORDER_COMMAND_REPOSITORY → OrderCommandRepositoryImpl
 */
@Module({
    imports: [TypeOrmModule.forFeature([Order])],
    controllers: [OrderController],
    providers: [
        OrderService,
        {
            provide: ORDER_QUERY_REPOSITORY,
            useClass: OrderQueryRepositoryImpl,
        },
        {
            provide: ORDER_COMMAND_REPOSITORY,
            useClass: OrderCommandRepositoryImpl,
        },
    ],
})
export class OrderModule {}
