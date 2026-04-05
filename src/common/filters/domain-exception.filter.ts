import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';

/**
 * DomainException을 HTTP 400 Bad Request로 매핑하는 필터
 *
 * main.ts에서 useGlobalFilters()로 전역 등록합니다.
 * 도메인 규칙 위반(4xx)과 실제 서버 오류(5xx)를 클라이언트가 구분할 수 있습니다.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
    catch(exception: DomainException, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();
        response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: exception.message,
        });
    }
}
