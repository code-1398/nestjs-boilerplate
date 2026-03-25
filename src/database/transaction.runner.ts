/**
 * @fileoverview 트랜잭션 실행기
 *
 * 커넥션 풀에서 커넥션을 획득하고, 트랜잭션을 실행한 뒤 커넥션을 반환합니다.
 * 성공 시 커밋, 예외 발생 시 롤백을 보장하며 finally 블록에서 반드시 커넥션을 반환합니다.
 *
 * 사용 예시:
 * ```typescript
 * await this.transactionRunner.run(async (manager) => {
 *   await manager.getRepository(Order).save(order);
 *   await manager.getRepository(Payment).save(payment);
 * });
 * ```
 */

import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

/**
 * 트랜잭션 콜백 타입
 *
 * @template T - 트랜잭션 결과 타입
 * @param manager - 트랜잭션에 묶인 EntityManager. 이 manager로 조작한 모든 작업이 하나의 트랜잭션에 포함됩니다.
 */
export type TransactionWork<T> = (manager: EntityManager) => Promise<T>;

/**
 * 트랜잭션 실행기
 *
 * {@link DataSource}(커넥션 풀)에서 커넥션을 획득하고,
 * 트랜잭션 범위 안에서 콜백을 실행한 뒤 커넥션을 풀에 반환합니다.
 *
 * 전역 모듈인 {@link DatabaseModule}을 통해 제공되므로
 * 별도 import 없이 생성자 주입으로 사용할 수 있습니다.
 */
@Injectable()
export class TransactionRunner {
    /**
     * @param dataSource - TypeORM DataSource (커넥션 풀). AppModule의 TypeOrmModule.forRoot()가 등록합니다.
     */
    constructor(private readonly dataSource: DataSource) {}

    /**
     * 트랜잭션 범위 안에서 콜백을 실행합니다.
     *
     * 실행 순서:
     * 1. 커넥션 풀에서 커넥션 획득 (`queryRunner.connect`)
     * 2. 트랜잭션 시작 (`BEGIN`)
     * 3. 콜백 실행
     * 4. 성공 → 커밋 (`COMMIT`)
     * 4. 실패 → 롤백 (`ROLLBACK`) 후 예외 재throw
     * 5. (항상) 커넥션을 풀에 반환 (`queryRunner.release`)
     *
     * @template T - 콜백의 반환 타입
     * @param work - 트랜잭션 안에서 실행할 작업. {@link EntityManager}를 받아 DB 작업을 수행합니다.
     * @returns 콜백의 반환값
     * @throws 콜백이 던진 예외를 롤백 후 그대로 재throw합니다.
     */
    async run<T>(work: TransactionWork<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await work(queryRunner.manager);
            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
