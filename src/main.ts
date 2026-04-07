import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config as appConfig } from '@config/config';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { OptimisticLockExceptionFilter } from './common/filters/optimistic-lock-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS 설정 — 프로덕션에서는 허용 출처를 명시적으로 지정하세요.
    app.enableCors({
        origin:
            appConfig.environment === 'prod'
                ? ['https://your-domain.com']
                : true,
        credentials: true,
    });

    app.useGlobalFilters(
        new DomainExceptionFilter(),
        new OptimisticLockExceptionFilter(),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Swagger는 비프로덕션 환경에서만 활성화 (document 생성 자체도 스킵하여 메모리 절약)
    if (appConfig.environment !== 'prod') {
        const config = new DocumentBuilder()
            .setTitle('NestJS Boilerplate')
            .setDescription(
                'DDD 레이어드 아키텍처 기반 NestJS 보일러플레이트 API',
            )
            .setVersion('1.0')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, document);
    }

    await app.listen(appConfig.server.port);
}
void bootstrap();
