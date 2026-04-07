import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Response } from 'express';
import { SSE_EVENT_TYPE } from '@constants/sse.constant';

/** heartbeat 전송 주기 (ms) — 프록시 idle 타임아웃보다 짧게 설정 */
const HEARTBEAT_INTERVAL_MS = 30_000;

interface SseClient {
    response: Response;
    heartbeatTimer: ReturnType<typeof setInterval>;
}

@Injectable()
export class SseService implements OnModuleDestroy {
    private clients = new Map<string, SseClient>();

    addClient(clientId: string, response: Response): void {
        // 재연결 시 구 연결(타이머 포함)을 먼저 종료하여 Map 오염 방지
        this.removeClient(clientId);

        // SSE 헤더 설정 (CORS는 전역 enableCors()에 위임)
        response.setHeader('Content-Type', 'text/event-stream');
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Connection', 'keep-alive');

        // 연결 확인 메시지 전송
        response.write(
            `data: {"type":"${SSE_EVENT_TYPE.CONNECTED}","message":"SSE connection established"}\n\n`,
        );

        // 프록시 idle 타임아웃으로 인한 침묵 종료 방지 — SSE comment 라인으로 heartbeat 전송
        // 전송 실패 시 끊어진 연결을 즉시 정리
        const heartbeatTimer = setInterval(() => {
            try {
                response.write(': heartbeat\n\n');
            } catch {
                this.removeClient(clientId);
            }
        }, HEARTBEAT_INTERVAL_MS);

        this.clients.set(clientId, { response, heartbeatTimer });

        // close 이벤트가 비동기로 늦게 도착해도 신규 연결을 삭제하지 않도록
        // Map의 현재 값이 자신인지 확인 후 정리
        response.on('close', () => {
            const current = this.clients.get(clientId);
            if (current?.response === response) {
                clearInterval(current.heartbeatTimer);
                this.clients.delete(clientId);
            }
        });
    }

    removeClient(clientId: string): void {
        const client = this.clients.get(clientId);
        if (client) {
            clearInterval(client.heartbeatTimer);
            client.response.end();
            this.clients.delete(clientId);
        }
    }

    /** 특정 클라이언트에게 이벤트를 전송합니다. 존재하지 않는 clientId는 무시합니다. */
    sendToClient(clientId: string, type: string, data: unknown): void {
        const client = this.clients.get(clientId);
        if (!client) return;
        try {
            client.response.write(`data: ${JSON.stringify({ type, data })}\n\n`);
        } catch (error) {
            console.error(`Error sending SSE to client ${clientId}:`, error);
            this.removeClient(clientId);
        }
    }

    /**
     * filter 조건을 만족하는 클라이언트에게 이벤트를 전송합니다.
     *
     * @param filter - clientId를 받아 전송 여부를 반환하는 predicate
     */
    sendToClients(
        filter: (clientId: string) => boolean,
        type: string,
        data: unknown,
    ): void {
        const message = JSON.stringify({ type, data });
        this.clients.forEach((client, clientId) => {
            if (!filter(clientId)) return;
            try {
                client.response.write(`data: ${message}\n\n`);
            } catch (error) {
                console.error(`Error sending SSE to client ${clientId}:`, error);
                this.removeClient(clientId);
            }
        });
    }

    /** 연결된 모든 클라이언트에게 이벤트를 브로드캐스트합니다. */
    sendMessage(type: string, data: unknown): void {
        this.sendToClients(() => true, type, data);
    }

    onModuleDestroy(): void {
        for (const clientId of this.clients.keys()) {
            this.removeClient(clientId);
        }
    }

    getConnectedClientsCount(): number {
        return this.clients.size;
    }
}
