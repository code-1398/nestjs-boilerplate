import { Injectable } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@config/config';

@Injectable()
export class S3Service {
    private s3Client: S3Client;
    private bucket: string;

    constructor() {
        this.s3Client = new S3Client({
            region: config.s3.region,
            credentials: {
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
            },
        });
        this.bucket = config.s3.bucket;
    }

    async uploadFile(
        file: Buffer,
        originalName: string,
        mimeType: string,
    ): Promise<{ key: string }> {
        // 확장자 추출
        const extension = originalName.split('.').pop() || '';
        const key = `images/${uuidv4()}${extension ? `.${extension}` : ''}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file,
            ContentType: mimeType,
        });

        await this.s3Client.send(command);

        return { key };
    }

    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3Client.send(command);
    }
}
