// ============================================================
// CACHE SERVICE — Section 4: Redis Caching Layer
// ============================================================
import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly PREFIX = 'finwallet:';
  private isAvailable = false;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    // Kiểm tra kết nối
    this.redis.ping().then(() => {
      this.isAvailable = true;
    }).catch(() => {
      this.isAvailable = false;
      this.logger.warn('Redis unavailable — caching disabled');
    });
  }

  // Lấy giá trị từ cache
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) return null;
    try {
      const val = await this.redis.get(this.PREFIX + key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  }

  // Lưu giá trị vào cache (TTL tính bằng giây)
  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.redis.setex(this.PREFIX + key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache set failed for key ${key}:`, err);
    }
  }

  // Xóa cache theo key
  async del(key: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.redis.del(this.PREFIX + key);
    } catch { /* ignore */ }
  }

  // Xóa tất cả cache có prefix (dùng khi data thay đổi)
  async delPattern(pattern: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      const keys = await this.redis.keys(`${this.PREFIX}${pattern}*`);
      if (keys.length > 0) await this.redis.del(...keys);
    } catch { /* ignore */ }
  }

  // Cache-aside pattern: lấy từ cache hoặc gọi hàm fetch và lưu lại
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  // Tạo cache key chuẩn hóa
  key(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}
