/**
 * @fileoverview 주문(Order) 도메인 엔티티
 *
 * 비즈니스 로직과 TypeORM 영속화 매핑을 하나의 클래스에서 담당합니다.
 * (Mapper 패턴 미사용 — 도메인 엔티티에 TypeORM 데코레이터 직접 적용)
 * 상태 변경은 반드시 도메인 메서드를 통해서만 수행합니다.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { DomainException } from '../../common/exceptions/domain.exception';

/** 주문 상태 열거형 */
export enum OrderStatus {
    /** 주문 생성 초기 상태 */
    PENDING = 'PENDING',
    /** 주문 접수 완료 */
    PLACED = 'PLACED',
    /** 주문 처리 완료 */
    COMPLETED = 'COMPLETED',
    /** 주문 취소 */
    CANCELLED = 'CANCELLED',
}

/**
 * 주문 도메인 엔티티
 *
 * 도메인 상태 전이 규칙:
 * - PENDING → {@link place}    → PLACED
 * - PLACED  → {@link complete} → COMPLETED
 * - PENDING | PLACED → {@link cancel} → CANCELLED
 */
@Entity('orders')
export class Order {
    /**
     * 주문 고유 식별자 (UUID)
     * 애플리케이션에서 생성하여 전달합니다.
     */
    @PrimaryColumn('uuid')
    id: string;

    /** 주문 제목 */
    @Column({ type: 'varchar', length: 255 })
    title: string;

    /**
     * 현재 주문 상태
     * 직접 수정하지 말고 {@link place}, {@link complete}, {@link cancel} 메서드를 사용하세요.
     */
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    /** 주문 수량 */
    @Column({ type: 'int' })
    quantity: number;

    /**
     * 주문 단가
     *
     * TypeORM의 decimal 타입은 JS로 반환 시 string이므로 transformer로 number 변환합니다.
     * parseFloat 기반이라 부동소수점 오차가 있을 수 있습니다.
     * 정밀도가 중요한 금융 도메인에서는 decimal.js 등 전용 라이브러리 또는 정수(센트) 단위 저장을 고려하세요.
     */
    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
        transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
    })
    price: number;

    /** 생성 일시 (자동 설정) */
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    /** 마지막 수정 일시 (자동 갱신) */
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    /** 낙관적 잠금용 버전 (TypeORM이 자동 관리, 충돌 시 OptimisticLockVersionMismatchError 발생) */
    @VersionColumn()
    version: number;

    // ──────────────────────────────────────────────
    // 팩토리 메서드
    // ──────────────────────────────────────────────

    /**
     * 신규 주문을 생성합니다. 초기 상태는 {@link OrderStatus.PENDING}입니다.
     *
     * @param id - 주문 고유 식별자 (UUID)
     * @param title - 주문 제목
     * @param quantity - 주문 수량 (양수여야 함)
     * @param price - 주문 단가 (0 이상이어야 함)
     * @returns 생성된 Order 인스턴스
     * @throws {Error} 수량이 0 이하이거나 단가가 음수인 경우
     */
    static create(id: string, title: string, quantity: number, price: number): Order {
        if (quantity <= 0) {
            throw new DomainException('주문 수량은 양수여야 합니다.');
        }
        if (price < 0) {
            throw new DomainException('주문 단가는 0 이상이어야 합니다.');
        }
        const order = new Order();
        order.id = id;
        order.title = title;
        order.status = OrderStatus.PENDING;
        order.quantity = quantity;
        order.price = price;
        return order;
    }

    // ──────────────────────────────────────────────
    // 도메인 행위 (비즈니스 로직)
    // ──────────────────────────────────────────────

    /**
     * 주문을 접수(PLACED) 상태로 전환합니다.
     *
     * @throws {Error} 현재 상태가 PENDING이 아닌 경우
     */
    place(): void {
        if (this.status !== OrderStatus.PENDING) {
            throw new DomainException(
                `PENDING 상태의 주문만 접수할 수 있습니다. 현재 상태: ${this.status}`,
            );
        }
        this.status = OrderStatus.PLACED;
    }

    /**
     * 주문을 완료(COMPLETED) 상태로 전환합니다.
     *
     * @throws {Error} 현재 상태가 PLACED가 아닌 경우
     */
    complete(): void {
        if (this.status !== OrderStatus.PLACED) {
            throw new DomainException(
                `PLACED 상태의 주문만 완료 처리할 수 있습니다. 현재 상태: ${this.status}`,
            );
        }
        this.status = OrderStatus.COMPLETED;
    }

    /**
     * 주문을 취소(CANCELLED) 상태로 전환합니다.
     * PENDING 또는 PLACED 상태의 주문만 취소할 수 있습니다.
     *
     * @throws {Error} 이미 완료되었거나 취소된 주문인 경우
     */
    cancel(): void {
        if (
            this.status === OrderStatus.COMPLETED ||
            this.status === OrderStatus.CANCELLED
        ) {
            throw new DomainException(
                `완료되었거나 이미 취소된 주문은 취소할 수 없습니다. 현재 상태: ${this.status}`,
            );
        }
        this.status = OrderStatus.CANCELLED;
    }

    /**
     * 주문 총액을 계산합니다.
     *
     * @returns 수량 × 단가
     */
    calculateTotal(): number {
        return this.quantity * this.price;
    }
}
