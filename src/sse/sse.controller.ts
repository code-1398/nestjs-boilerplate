/**
 * @fileoverview SSE(Server-Sent Events) 컨트롤러
 *
 * 클라이언트의 SSE 연결 요청을 처리합니다.
 * 연결된 클라이언트는 {@link SseService}를 통해 실시간 이벤트를 수신합니다.
 */

import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiExtraModels,
} from '@nestjs/swagger';
import { SseService } from './sse.service';
import { v4 as uuidv4 } from 'uuid';
import { SseConnectionEventDto } from './dto/sse-event.dto';

/**
 * SSE 연결 관리 컨트롤러
 *
 * 기본 경로: /sse
 */
@ApiTags('Server-Sent Events')
@ApiExtraModels(SseConnectionEventDto)
@Controller('sse')
export class SseController {
    /**
     * @param sseService - SSE 클라이언트 관리 서비스 (DI 주입)
     */
    constructor(private readonly sseService: SseService) {}

    /**
     * SSE 연결을 수립합니다.
     * 연결 후 서버에서 발생하는 이벤트를 실시간으로 수신합니다.
     *
     * @param request - HTTP 요청 (clientId 쿼리 파라미터 포함)
     * @param response - HTTP 응답 (SSE 스트림으로 사용)
     */
    @Get('connect')
    @ApiOperation({
        summary: 'SSE 연결 수립',
        description: `
Server-Sent Events 연결을 수립합니다.

**연결 후 수신 가능한 이벤트:**

### \`connected\` - 연결 완료 알림
\`\`\`json
{
  "type": "connected",
  "data": { "message": "SSE connection established" }
}
\`\`\`

**사용 예시 (JavaScript):**
\`\`\`javascript
const eventSource = new EventSource('/sse/connect?clientId=my-client');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.type, data.data);
};
\`\`\`
        `,
    })
    @ApiQuery({
        name: 'clientId',
        required: false,
        description: '클라이언트 식별자 (미제공 시 자동 생성)',
        type: 'string',
        example: 'client-123',
    })
    @ApiResponse({
        status: 200,
        description: 'SSE 스트림 연결 성공',
        content: {
            'text/event-stream': {
                schema: {
                    type: 'string',
                    description: 'Server-Sent Events 스트림',
                },
                examples: {
                    connection: {
                        summary: '연결 이벤트',
                        value: 'data: {"type":"connected","data":{"message":"SSE connection established"}}\n\n',
                    },
                },
            },
        },
    })
    connect(@Req() request: Request, @Res() response: Response): void {
        const clientId = (request.query.clientId as string) || uuidv4();
        this.sseService.addClient(clientId, response);
    }
}
