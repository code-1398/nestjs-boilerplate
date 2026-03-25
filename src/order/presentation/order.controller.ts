/**
 * @fileoverview 주문 HTTP 컨트롤러
 *
 * HTTP 요청을 애플리케이션 서비스로 위임합니다.
 * 요청/응답 직렬화만 담당하며 비즈니스 로직을 포함하지 않습니다.
 */

import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../application/order.service.js';
import { OrderStatus } from '../domain/order.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';

/**
 * 주문 관리 API 컨트롤러
 *
 * 기본 경로: /orders
 */
@ApiTags('주문')
@Controller('orders')
export class OrderController {
    /**
     * @param orderService - 주문 애플리케이션 서비스 (DI 주입)
     */
    constructor(private readonly orderService: OrderService) {}

    /**
     * 새 주문을 생성합니다.
     *
     * @param dto - 주문 생성 요청 데이터
     * @returns 생성된 주문 정보
     */
    @Post()
    @ApiOperation({ summary: '주문 생성', description: '새 주문을 생성합니다. 초기 상태는 PENDING입니다.' })
    @ApiResponse({ status: 201, description: '주문 생성 성공', type: OrderResponseDto })
    async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
        const order = await this.orderService.createOrder(dto.title, dto.quantity, dto.price);
        return OrderResponseDto.fromDomain(order);
    }

    /**
     * 주문 목록을 조회합니다. 상태로 필터링할 수 있습니다.
     *
     * @param status - (선택) 필터링할 주문 상태
     * @returns 주문 목록
     */
    @Get()
    @ApiOperation({ summary: '주문 목록 조회', description: '전체 또는 상태별 주문 목록을 조회합니다.' })
    @ApiQuery({ name: 'status', enum: OrderStatus, required: false, description: '주문 상태 필터' })
    @ApiResponse({ status: 200, description: '조회 성공', type: [OrderResponseDto] })
    async findAll(@Query('status') status?: OrderStatus): Promise<OrderResponseDto[]> {
        const orders = status
            ? await this.orderService.findByStatus(status)
            : await this.orderService.findAll();
        return orders.map(OrderResponseDto.fromDomain);
    }

    /**
     * ID로 단일 주문을 조회합니다.
     *
     * @param id - 조회할 주문 UUID
     * @returns 주문 상세 정보
     */
    @Get(':id')
    @ApiOperation({ summary: '주문 단건 조회' })
    @ApiParam({ name: 'id', description: '주문 UUID' })
    @ApiResponse({ status: 200, description: '조회 성공', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: '주문 없음' })
    async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
        const order = await this.orderService.findById(id);
        return OrderResponseDto.fromDomain(order);
    }

    /**
     * 주문을 접수(PLACED) 상태로 전환합니다.
     * PENDING 상태의 주문만 접수 가능합니다.
     *
     * @param id - 접수할 주문 UUID
     * @returns 업데이트된 주문 정보
     */
    @Patch(':id/place')
    @ApiOperation({ summary: '주문 접수', description: 'PENDING → PLACED 상태로 전환합니다.' })
    @ApiParam({ name: 'id', description: '주문 UUID' })
    @ApiResponse({ status: 200, description: '접수 성공', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: '주문 없음' })
    async place(@Param('id') id: string): Promise<OrderResponseDto> {
        const order = await this.orderService.placeOrder(id);
        return OrderResponseDto.fromDomain(order);
    }

    /**
     * 주문을 완료(COMPLETED) 상태로 전환합니다.
     * PLACED 상태의 주문만 완료 가능합니다.
     *
     * @param id - 완료 처리할 주문 UUID
     * @returns 업데이트된 주문 정보
     */
    @Patch(':id/complete')
    @ApiOperation({ summary: '주문 완료', description: 'PLACED → COMPLETED 상태로 전환합니다.' })
    @ApiParam({ name: 'id', description: '주문 UUID' })
    @ApiResponse({ status: 200, description: '완료 처리 성공', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: '주문 없음' })
    async complete(@Param('id') id: string): Promise<OrderResponseDto> {
        const order = await this.orderService.completeOrder(id);
        return OrderResponseDto.fromDomain(order);
    }

    /**
     * 주문을 취소(CANCELLED) 상태로 전환합니다.
     * PENDING 또는 PLACED 상태의 주문만 취소 가능합니다.
     *
     * @param id - 취소할 주문 UUID
     * @returns 업데이트된 주문 정보
     */
    @Patch(':id/cancel')
    @ApiOperation({ summary: '주문 취소', description: 'PENDING 또는 PLACED → CANCELLED 상태로 전환합니다.' })
    @ApiParam({ name: 'id', description: '주문 UUID' })
    @ApiResponse({ status: 200, description: '취소 성공', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: '주문 없음' })
    async cancel(@Param('id') id: string): Promise<OrderResponseDto> {
        const order = await this.orderService.cancelOrder(id);
        return OrderResponseDto.fromDomain(order);
    }

    /**
     * 주문을 삭제합니다.
     *
     * @param id - 삭제할 주문 UUID
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: '주문 삭제' })
    @ApiParam({ name: 'id', description: '주문 UUID' })
    @ApiResponse({ status: 204, description: '삭제 성공' })
    @ApiResponse({ status: 404, description: '주문 없음' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.orderService.deleteOrder(id);
    }
}
