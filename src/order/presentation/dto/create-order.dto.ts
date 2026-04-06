/**
 * @fileoverview 주문 생성 요청 DTO
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

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
    @MaxLength(255)
    title: string;

    /**
     * 주문 수량 (1 이상 정수)
     * @example 2
     */
    @ApiProperty({ description: '주문 수량 (1 이상 정수)', example: 2 })
    @IsInt()
    @Min(1)
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
