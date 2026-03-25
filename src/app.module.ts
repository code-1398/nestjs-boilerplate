/**
 * @fileoverview 루트 애플리케이션 모듈
 *
 * 전역 인프라(DB, Kafka, S3, SSE) 및 도메인 모듈을 조합합니다.
 * 새 도메인 모듈은 imports 배열에 추가합니다.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '@config/config';
import { DatabaseModule } from './database/database.module.js';
import { KafkaModule } from './kafka/kafka.module.js';
import { S3Module } from './s3/s3.module.js';
import { SseModule } from './sse/sse.module.js';
import { OrderModule } from './order/order.module.js';

/**
 * 루트 모듈
 *
 * - TypeORM: PostgreSQL 연결 (ORM 엔티티 자동 로드: *.orm-entity.ts)
 * - DatabaseModule: 전역 커넥션 풀(DataSource) + TransactionRunner (global)
 * - KafkaModule: 전역 Kafka 프로듀서/컨슈머 (global)
 * - S3Module: 전역 AWS S3 클라이언트 (global)
 * - SseModule: 전역 Server-Sent Events 서비스 (global)
 * - OrderModule: 주문(Order) 도메인 모듈
 */
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
        }),
        DatabaseModule,
        KafkaModule,
        S3Module,
        SseModule,
        OrderModule,
    ],
})
export class AppModule {}
