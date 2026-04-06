import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto.js';
import { OrderStatus } from '../../domain/order.entity.js';

/**
 * 주문 목록 페이지네이션 쿼리 DTO
 *
 * PaginationDto를 상속하여 page/limit와 status 필터를 단일 @Query()로 바인딩합니다.
 * forbidNonWhitelisted와의 충돌 방지를 위해 status를 이 DTO에 선언합니다.
 */
export class OrderPaginationQueryDto extends PaginationDto {
    @ApiPropertyOptional({ enum: OrderStatus, description: '주문 상태 필터' })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}
