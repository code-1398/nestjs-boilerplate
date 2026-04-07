import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../dto/paginated-response.dto.js';

/**
 * 페이지네이션 응답의 Swagger 스키마를 정확히 표현하는 데코레이터
 *
 * TypeScript 제네릭은 런타임에 소거되어 Swagger가 data 타입을 추론할 수 없으므로,
 * allOf + $ref 조합으로 data 아이템 타입을 명시합니다.
 *
 * @param model - data 배열의 아이템 타입 (e.g. OrderResponseDto)
 *
 * @example
 * \@ApiPaginatedResponse(OrderResponseDto)
 * async findPaginated(...) { ... }
 */
export function ApiPaginatedResponse<T extends Type>(model: T) {
    return applyDecorators(
        ApiExtraModels(PaginatedResponseDto, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatedResponseDto) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
}
