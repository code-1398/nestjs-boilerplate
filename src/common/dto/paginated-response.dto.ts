import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
    @ApiProperty({ description: '조회된 항목 목록', isArray: true })
    data: T[];

    @ApiProperty({ description: '전체 항목 수' })
    total: number;

    @ApiProperty({ description: '현재 페이지 번호' })
    page: number;

    @ApiProperty({ description: '페이지당 항목 수' })
    limit: number;

    @ApiProperty({ description: '전체 페이지 수' })
    totalPages: number;

    static of<T>(data: T[], total: number, page: number, limit: number): PaginatedResponseDto<T> {
        const dto = new PaginatedResponseDto<T>();
        dto.data = data;
        dto.total = total;
        dto.page = page;
        dto.limit = limit;
        dto.totalPages = Math.ceil(total / limit);
        return dto;
    }
}
