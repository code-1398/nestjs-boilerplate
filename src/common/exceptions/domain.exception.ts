/**
 * 도메인 비즈니스 규칙 위반을 나타내는 예외 클래스
 *
 * 도메인 계층이 NestJS/HTTP에 직접 의존하지 않도록,
 * 순수 Error를 상속합니다.
 * DomainExceptionFilter가 이를 잡아 4xx HTTP 응답으로 매핑합니다.
 */
export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainException';
    }
}
