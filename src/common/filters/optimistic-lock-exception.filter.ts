import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { OptimisticLockVersionMismatchError } from 'typeorm';

/**
 * TypeORM 낙관적 잠금 충돌을 HTTP 409 Conflict로 매핑하는 필터
 *
 * 동시에 같은 리소스를 수정하려 할 때 발생하며,
 * 클라이언트는 최신 데이터를 재조회 후 재시도해야 합니다.
 */
@Catch(OptimisticLockVersionMismatchError)
export class OptimisticLockExceptionFilter implements ExceptionFilter {
    catch(_exception: OptimisticLockVersionMismatchError, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();
        response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            error: 'Conflict',
            message: '다른 요청에 의해 리소스가 변경되었습니다. 최신 데이터를 조회 후 재시도해 주세요.',
        });
    }
}
