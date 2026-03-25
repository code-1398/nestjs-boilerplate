import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config as appConfig } from '@config/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS 설정
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('Orderbook Backend')
        .setDescription('DDD 레이어드 아키텍처 기반 주문 관리 API')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(appConfig.server.port);
}
void bootstrap();
