/**
 * @fileoverview 데이터베이스 공용 모듈
 *
 * 커넥션 풀({@link DataSource})과 트랜잭션 실행기({@link TransactionRunner})를
 * 애플리케이션 전역에 제공합니다.
 *
 * AppModule에 등록하면 다른 모듈에서 별도 import 없이 주입받을 수 있습니다.
 *
 * 주입 가능한 프로바이더:
 * - {@link DataSource}        - TypeORM 커넥션 풀. 직접 쿼리나 마이그레이션에 사용합니다.
 * - {@link TransactionRunner} - 트랜잭션 실행기. 여러 작업을 하나의 트랜잭션으로 묶을 때 사용합니다.
 */

import { Global, Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TransactionRunner } from './transaction.runner.js';

/**
 * 데이터베이스 공용 전역 모듈
 *
 * `@Global()` 데코레이터로 전역 등록되므로 AppModule에 한 번만 추가하면
 * 모든 도메인 모듈에서 {@link TransactionRunner}와 {@link DataSource}를 주입받을 수 있습니다.
 *
 * {@link DataSource}는 `TypeOrmModule.forRoot()`가 등록한 인스턴스를 그대로 노출합니다.
 * 커넥션 풀 설정은 AppModule의 TypeORM 설정에서 관리합니다.
 */
@Global()
@Module({
    providers: [
        {
            provide: DataSource,
            useFactory: (dataSource: DataSource) => dataSource,
            inject: [getDataSourceToken()],
        },
        TransactionRunner,
    ],
    exports: [DataSource, TransactionRunner],
})
export class DatabaseModule {}
