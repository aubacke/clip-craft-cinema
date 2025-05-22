/**
 * Intelligent caching strategies for optimizing data access
 */

// Cache item with expiration and metadata
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiry?: number; // Optional expiration time in ms
  accessCount: number;
  lastAccessed: number;
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  
  constructor(options: {
    maxSize?: number; // Maximum number of items to store
    defaultTTL?: number; // Default time-to-live in ms
  } = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
  }
  
  /**
   * Store a value in the cache with optional expiration
   */
  set(key: string, value: T, ttl?: number): void {
    // Enforce cache size limits with intelligent eviction
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastValuable();
    }
    
    const now = Date.now();
    this.cache.set(key, {
      value,
      timestamp: now,
      expiry: ttl ? now + ttl : undefined,
      accessCount: 1,
      lastAccessed: now
    });
  }
  
  /**
   * Get a value from the cache if it exists and isn't expired
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    const now = Date.now();
    
    // Check if expired
    if (item.expiry && item.expiry < now) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access stats
    item.accessCount++;
    item.lastAccessed = now;
    
    return item.value;
  }
  
  /**
   * Remove an item from the cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get the current size of the cache
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Evict the least valuable item based on recency and frequency
   */
  private evictLeastValuable(): void {
    if (this.cache.size === 0) return;
    
    const now = Date.now();
    let leastValuableKey: string | null = null;
    let leastValuableScore = Infinity;
    
    // Score is based on recency and access frequency
    for (const [key, item] of this.cache.entries()) {
      const recency = now - item.lastAccessed;
      const frequency = item.accessCount;
      
      // Lower score = more valuable (keep)
      // Higher score = less valuable (evict)
      const score = recency / (frequency * frequency);
      
      if (score < leastValuableScore) {
        leastValuableScore = score;
        leastValuableKey = key;
      }
    }
    
    if (leastValuableKey) {
      this.cache.delete(leastValuableKey);
    }
  }
  
  /**
   * Remove all expired items from the cache
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Create default instance
export const globalCache = new CacheManager();
