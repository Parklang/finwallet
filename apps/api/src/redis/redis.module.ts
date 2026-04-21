// ============================================================
// REDIS MODULE — Section 4: Cache & Session Infrastructure
// ============================================================
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';

import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        const password = configService.get<string>('REDIS_PASSWORD') || undefined;

        const redis = new Redis({ host, port, password, lazyConnect: true });

        redis.on('connect', () => console.log(`[Redis] Connected to ${host}:${port}`));
        redis.on('error', () => { /* ignore reconnect spam */ });

        try {
          await redis.connect();
        } catch (_) {
          console.warn('[Redis] Could not connect — caching disabled');
        }

        return redis;
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: [REDIS_CLIENT, CacheService],
})
export class RedisModule { }
