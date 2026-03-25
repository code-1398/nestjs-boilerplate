import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer, Partitioners } from 'kafkajs';
import { config } from '@config/config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;

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

    private async connectConsumerInBackground() {
        try {
            await this.consumer.connect();
            this.isConsumerConnected = true;
            console.log('Kafka consumer connected successfully');
        } catch (error) {
            console.error('Failed to connect Kafka consumer:', error);
            // 5초 후 재시도
            setTimeout(() => void this.connectConsumerInBackground(), 5000);
        }
    }

    private async waitForConsumerConnection(): Promise<void> {
        return new Promise((resolve) => {
            const checkConnection = () => {
                if (this.isConsumerConnected) {
                    resolve();
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }

    async onModuleDestroy() {
        await this.producer.disconnect();
        await this.consumer.disconnect();
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

    private topicHandlers = new Map<
        string,
        (message: unknown) => Promise<void>
    >();
    private isConsumerRunning = false;
    private isConsumerConnected = false;

    async subscribeToTopic(
        topic: string,
        callback: (message: unknown) => Promise<void>,
    ) {
        const topicWithEnv = `${topic}-${config.environment}`;
        this.topicHandlers.set(topicWithEnv, callback);

        // Consumer가 연결될 때까지 대기
        await this.waitForConsumerConnection();

        if (!this.isConsumerRunning) {
            await this.consumer.subscribe({ topic: topicWithEnv });
        } else {
            // 이미 실행 중인 경우, 새 토픽을 구독하려면 consumer를 다시 시작해야 함
            await this.consumer.stop();
            this.isConsumerRunning = false;

            // 모든 토픽을 다시 구독
            const topics = Array.from(this.topicHandlers.keys());
            for (const topicName of topics) {
                await this.consumer.subscribe({ topic: topicName });
            }
        }

        // consumer.run은 한 번만 실행
        if (!this.isConsumerRunning) {
            this.isConsumerRunning = true;
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
    }
}
