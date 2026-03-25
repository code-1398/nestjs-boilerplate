import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { SSE_EVENT_TYPE } from '@constants/sse.constant';

@Injectable()
export class SseService {
    private clients = new Map<string, Response>();

    addClient(clientId: string, response: Response): void {
        // SSE 헤더 설정
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

        // 연결 확인 메시지 전송
        response.write(
            `data: {"type":"${SSE_EVENT_TYPE.CONNECTED}","message":"SSE connection established"}\n\n`,
        );

        this.clients.set(clientId, response);

        // 클라이언트 연결 종료 시 정리
        response.on('close', () => {
            this.clients.delete(clientId);
        });
    }

    removeClient(clientId: string): void {
        const client = this.clients.get(clientId);
        if (client) {
            client.end();
            this.clients.delete(clientId);
        }
    }

    sendMessage(type: string, data: unknown): void {
        const message = JSON.stringify({
            type,
            data,
        });

        this.clients.forEach((response, clientId) => {
            try {
                response.write(`data: ${message}\n\n`);
            } catch (error) {
                console.error(
                    `Error sending SSE to client ${clientId}:`,
                    error,
                );
                this.clients.delete(clientId);
            }
        });
    }

    getConnectedClientsCount(): number {
        return this.clients.size;
    }
}
