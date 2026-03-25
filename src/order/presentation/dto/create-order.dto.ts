/**
 * @fileoverview 주문 생성 요청 DTO
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, Min, MinLength } from 'class-validator';

/**
 * 주문 생성 요청 본문 스키마
 */
export class CreateOrderDto {
    /**
     * 주문 제목
     * @example "갤럭시 S25 주문"
     */
    @ApiProperty({ description: '주문 제목', example: '갤럭시 S25 주문' })
    @IsString()
    @MinLength(1)
    title: string;

    /**
     * 주문 수량 (양수)
     * @example 2
     */
    @ApiProperty({ description: '주문 수량 (양수)', example: 2 })
    @IsNumber()
    @IsPositive()
    quantity: number;

    /**
     * 주문 단가 (0 이상)
     * @example 1200000
     */
    @ApiProperty({ description: '주문 단가 (0 이상)', example: 1200000 })
    @IsNumber()
    @Min(0)
    price: number;
}
