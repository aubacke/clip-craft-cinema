
import { compressData, decompressData } from './compressionUtils';

/**
 * StorageManager provides an optimized interface for working with localStorage
 * with features like batching, throttling, and compression.
 */
export class StorageManager {
  private batchedWrites: Map<string, any> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private compressionThreshold: number = 10000; // Only compress data larger than 10KB
  private schemaVersion: number = 1;
  private initialized: boolean = false;
  
  constructor(
    private prefix: string = 'app_', 
    private debounceTime: number = 300
  ) {
    this.initializeSchema();
  }
  
  /**
   * Initialize storage schema and handle migrations if needed
   */
  private initializeSchema(): void {
    if (this.initialized) return;
    
    try {
      const versionStr = localStorage.getItem(`${this.prefix}schema_version`);
      const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;
      
      // If we need to migrate
      if (currentVersion < this.schemaVersion) {
        this.migrateSchema(currentVersion, this.schemaVersion);
        localStorage.setItem(`${this.prefix}schema_version`, this.schemaVersion.toString());
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing storage schema:', error);
    }
  }
  
  /**
   * Handle migrations between schema versions
   */
  private migrateSchema(fromVersion: number, toVersion: number): void {
    // Example migration logic
    if (fromVersion === 0 && toVersion >= 1) {
      // Migrate from version 0 to 1
      console.log('Migrating storage schema from version 0 to 1');
      // Example: rename a key or restructure data
    }
    
    // Add more migration steps as needed
  }
  
  /**
   * Set an item in storage with optional compression
   */
  setItem(key: string, value: any): void {
    // Schedule a batched write
    this.batchedWrites.set(key, value);
    
    // Clear any existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Set a new timer
    const timer = setTimeout(() => {
      this.flushItem(key);
    }, this.debounceTime);
    
    this.debounceTimers.set(key, timer);
  }
  
  /**
   * Write a specific item from batch to storage
   */
  private flushItem(key: string): void {
    if (!this.batchedWrites.has(key)) return;
    
    try {
      const value = this.batchedWrites.get(key);
      const serialized = JSON.stringify(value);
      
      // Apply compression for large data
      const finalData = serialized.length > this.compressionThreshold
        ? compressData(serialized)
        : serialized;
      
      // Store with metadata about compression
      const storageObject = {
        data: finalData,
        compressed: serialized.length > this.compressionThreshold,
        timestamp: Date.now(),
        version: this.schemaVersion
      };
      
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(storageObject));
      this.batchedWrites.delete(key);
      this.debounceTimers.delete(key);
    } catch (error) {
      console.error(`Error saving item ${key} to localStorage:`, error);
    }
  }
  
  /**
   * Get an item from storage with automatic decompression
   */
  getItem<T>(key: string, defaultValue?: T): T | null | undefined {
    try {
      const rawData = localStorage.getItem(`${this.prefix}${key}`);
      if (!rawData) return defaultValue ?? null;
      
      const storageObject = JSON.parse(rawData);
      
      // Handle compressed data
      if (storageObject.compressed) {
        const decompressed = decompressData(storageObject.data);
        return JSON.parse(decompressed);
      }
      
      return JSON.parse(storageObject.data);
    } catch (error) {
      console.error(`Error retrieving item ${key} from localStorage:`, error);
      return defaultValue ?? null;
    }
  }
  
  /**
   * Remove an item from storage and batch
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(`${this.prefix}${key}`);
      this.batchedWrites.delete(key);
      
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
        this.debounceTimers.delete(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  }
  
  /**
   * Flush all pending writes immediately
   */
  flushAll(): void {
    // Copy keys to avoid modification during iteration
    const keys = Array.from(this.batchedWrites.keys());
    keys.forEach(key => this.flushItem(key));
  }
  
  /**
   * Get all keys with a specific prefix
   */
  getKeys(subPrefix: string = ''): string[] {
    const fullPrefix = `${this.prefix}${subPrefix}`;
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    
    return keys;
  }
  
  /**
   * Clear all items managed by this storage manager
   */
  clear(): void {
    const keys = this.getKeys();
    keys.forEach(key => this.removeItem(key));
  }
  
  /**
   * Update an item using an updater function
   */
  updateItem<T>(key: string, updater: (prevValue: T | null) => T): void {
    const prevValue = this.getItem<T>(key);
    const newValue = updater(prevValue);
    this.setItem(key, newValue);
  }
}

// Create default instance
export const storageManager = new StorageManager();
