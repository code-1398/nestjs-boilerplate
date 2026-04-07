/**
 * @fileoverview SSE(Server-Sent Events) 공통 DTO
 *
 * SSE 연결 및 이벤트 전송에 사용하는 공통 데이터 구조입니다.
 * 도메인별 이벤트 데이터는 각 도메인 모듈에서 정의합니다.
 */

import { ApiProperty } from '@nestjs/swagger';
import { SSE_EVENT_TYPE, type SseEventType } from '@constants/sse.constant';

/**
 * SSE 이벤트 기본 구조
 */
export class SseBaseEventDto {
    /**
     * 이벤트 타입
     * @example "imageStatusUpdate"
     */
    @ApiProperty({
        description: '이벤트 타입',
        example: SSE_EVENT_TYPE.IMAGE_STATUS_UPDATE,
    })
    type: SseEventType;

    /**
     * 이벤트 페이로드 (도메인별 데이터)
     */
    @ApiProperty({
        description: '이벤트 데이터 (도메인별 구조)',
    })
    data: unknown;
}

/**
 * SSE 연결 성공 이벤트 데이터
 */
export class ConnectionEventDataDto {
    /**
     * 연결 확인 메시지
     * @example "SSE connection established"
     */
    @ApiProperty({
        description: '연결 확인 메시지',
        example: 'SSE connection established',
    })
    message: string;
}

/**
 * SSE 연결 이벤트 전체 구조
 */
export class SseConnectionEventDto {
    /**
     * 이벤트 타입 (고정값: "connected")
     */
    @ApiProperty({
        description: '이벤트 타입',
        example: SSE_EVENT_TYPE.CONNECTED,
    })
    type: typeof SSE_EVENT_TYPE.CONNECTED;

    /**
     * 연결 이벤트 데이터
     */
    @ApiProperty({
        description: '연결 이벤트 데이터',
        type: ConnectionEventDataDto,
    })
    data: ConnectionEventDataDto;
}
