export const SSE_EVENT_TYPE = {
    CONNECTED: 'connected',
    IMAGE_STATUS_UPDATE: 'imageStatusUpdate',
} as const;

export type SseEventType = (typeof SSE_EVENT_TYPE)[keyof typeof SSE_EVENT_TYPE];
