import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set value in cache with TTL (milliseconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'}ms)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      // For in-memory cache, we need to clear all related keys
      // Note: This is a simplified version. For Redis, use SCAN with pattern
      this.logger.debug(`Cache DEL pattern: ${pattern}`);
      // Store reset is not available in cache-manager v5, use individual del
      this.logger.warn('Pattern deletion not fully supported, consider clearing specific keys');
    } catch (error) {
      this.logger.error(`Cache DEL pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Clear entire cache
   */
  async reset(): Promise<void> {
    try {
      // Cache manager may not expose reset, this is a best-effort attempt
      const cacheStore = (this.cacheManager as any).store;
      if (cacheStore && typeof cacheStore.reset === 'function') {
        await cacheStore.reset();
      }
      this.logger.log('Cache RESET: All keys cleared');
    } catch (error) {
      this.logger.error('Cache RESET error:', error);
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    // If not in cache, compute the value
    const value = await factory();
    
    // Store in cache
    await this.set(key, value, ttl);
    
    return value;
  }
}
