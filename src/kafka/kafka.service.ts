import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { Kafka, Producer, Consumer, Partitioners } from 'kafkajs';
import { config } from '@config/config';

@Injectable()
export class KafkaService
    implements OnModuleInit, OnApplicationBootstrap, OnModuleDestroy
{
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;

    private topicHandlers = new Map<
        string,
        (message: unknown) => Promise<void>
    >();
    private isConsumerConnected = false;
    private isDestroyed = false;
    private retryTimer: ReturnType<typeof setTimeout> | null = null;

    async onModuleInit() {
        this.kafka = new Kafka({
            clientId: config.kafka.clientId,
            brokers: config.kafka.brokers,
            connectionTimeout: 10000,
            requestTimeout: 30000,
            retry: {
                initialRetryTime: 100,
                retries: 8,
            },
            ssl: true,
            sasl: {
                mechanism: 'plain',
                username: config.kafka.username,
                password: config.kafka.password,
            },
        });

        this.producer = this.kafka.producer({
            createPartitioner: Partitioners.LegacyPartitioner,
        });
        this.consumer = this.kafka.consumer({
            groupId: config.kafka.clientId,
        });

        await this.producer.connect();

        // Consumer는 백그라운드에서 연결
        void this.connectConsumerInBackground();
    }

    /**
     * 모든 모듈 초기화 완료 후 호출됩니다.
     * 등록된 모든 토픽을 한 번에 구독하고 consumer.run()을 단 1회 호출합니다.
     * 이 방식으로 race condition과 stop/run 사이 데이터 유실을 방지합니다.
     */
    async onApplicationBootstrap() {
        if (this.topicHandlers.size === 0) return;

        await this.waitForConsumerConnection();

        for (const topic of this.topicHandlers.keys()) {
            await this.consumer.subscribe({ topic });
        }

        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                const handler = this.topicHandlers.get(topic);
                if (handler) {
                    const parsedMessage: unknown = JSON.parse(
                        message.value?.toString() || '{}',
                    );
                    await handler(parsedMessage);
                }
            },
        });
    }

    async onModuleDestroy() {
        this.isDestroyed = true;
        if (this.retryTimer !== null) {
            clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }
        await this.producer.disconnect();
        await this.consumer.disconnect();
    }

    private async connectConsumerInBackground() {
        try {
            await this.consumer.connect();
            this.isConsumerConnected = true;
            console.log('Kafka consumer connected successfully');
        } catch (error) {
            if (this.isDestroyed) return;
            console.error('Failed to connect Kafka consumer:', error);
            this.retryTimer = setTimeout(
                () => void this.connectConsumerInBackground(),
                5000,
            );
        }
    }

    /**
     * Consumer 연결이 완료될 때까지 대기합니다.
     *
     * @param timeoutMs - 최대 대기 시간 (기본 30초). 초과 시 reject.
     * @throws {Error} 타임아웃 초과 시
     */
    private waitForConsumerConnection(timeoutMs = 30_000): Promise<void> {
        const start = Date.now();
        return new Promise((resolve, reject) => {
            const check = () => {
                if (this.isConsumerConnected) {
                    resolve();
                } else if (this.isDestroyed) {
                    reject(new Error('Kafka consumer connection aborted: module destroyed'));
                } else if (Date.now() - start >= timeoutMs) {
                    reject(new Error('Kafka consumer connection timed out'));
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    async publishMessage(topic: string, message: unknown) {
        try {
            const topicWithEnv = `${topic}-${config.environment}`;
            await this.producer.send({
                topic: topicWithEnv,
                messages: [
                    {
                        value: JSON.stringify(message),
                    },
                ],
            });
        } catch (error) {
            console.error(
                `Failed to publish message to topic ${topic}:`,
                error,
            );
            throw error;
        }
    }

    /**
     * 토픽 핸들러를 등록합니다.
     * 실제 구독과 consumer.run()은 onApplicationBootstrap에서 일괄 처리됩니다.
     *
     * @param topic - 구독할 토픽 이름 (환경 접미사 자동 추가)
     * @param callback - 메시지 수신 시 실행할 핸들러
     */
    subscribeToTopic(
        topic: string,
        callback: (message: unknown) => Promise<void>,
    ): void {
        const topicWithEnv = `${topic}-${config.environment}`;
        this.topicHandlers.set(topicWithEnv, callback);
    }
}
