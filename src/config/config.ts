import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const configSchema = z.object({
    server: z.object({
        port: z.number().default(3000),
    }),
    database: z.object({
        host: z.string().min(1),
        port: z.number().default(5432),
        username: z.string().min(1),
        password: z.string().min(1),
        database: z.string().min(1),
    }),
    kafka: z
        .object({
            brokers: z.array(z.string()),
            clientId: z.string().min(1),
            username: z.string().min(1),
            password: z.string().min(1),
        })
        .optional(),
    s3: z
        .object({
            region: z.string().min(1),
            bucket: z.string().min(1),
            accessKeyId: z.string().min(1),
            secretAccessKey: z.string().min(1),
        })
        .optional(),
    environment: z.enum(['dev', 'prod']).default('dev'),
});

function loadConfig() {
    const configPath = join(process.cwd(), 'config.json');

    if (!existsSync(configPath)) {
        throw new Error('config.json file not found in project root');
    }

    try {
        const fileContent = readFileSync(configPath, 'utf-8');
        const configData: unknown = JSON.parse(fileContent);
        return configSchema.parse(configData);
    } catch (error) {
        throw new Error(`Failed to parse config.json: ${error}`);
    }
}

export const config = loadConfig();
export type Config = z.infer<typeof configSchema>;
