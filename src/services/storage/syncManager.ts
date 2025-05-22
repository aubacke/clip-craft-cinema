
import { storageManager } from './storageManager';

// Define sync operation types
type SyncOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data?: any;
  timestamp: number;
  synced: boolean;
};

/**
 * SyncManager handles offline data persistence and synchronization
 * when the application comes back online.
 */
export class SyncManager {
  private pendingOperations: SyncOperation[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<() => void> = new Set();
  
  constructor() {
    // Load pending operations from storage
    this.loadPendingOperations();
    
    // Set up online/offline listeners
    window.addEventListener('online', () => this.handleOnlineStatusChange(true));
    window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
    
    // Attempt to sync on startup if online
    if (this.isOnline) {
      this.sync();
    }
  }
  
  /**
   * Handle online status changes
   */
  private handleOnlineStatusChange(online: boolean): void {
    this.isOnline = online;
    
    if (online && this.hasPendingOperations()) {
      this.sync();
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Register operation for sync
   */
  addOperation(operation: Omit<SyncOperation, 'timestamp' | 'synced' | 'id'>): string {
    const id = crypto.randomUUID();
    const newOperation: SyncOperation = {
      id,
      ...operation,
      timestamp: Date.now(),
      synced: false
    };
    
    this.pendingOperations.push(newOperation);
    this.savePendingOperations();
    
    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.sync();
    }
    
    return id;
  }
  
  /**
   * Check if there are any pending operations
   */
  hasPendingOperations(): boolean {
    return this.pendingOperations.some(op => !op.synced);
  }
  
  /**
   * Get the number of pending operations
   */
  getPendingOperationsCount(): number {
    return this.pendingOperations.filter(op => !op.synced).length;
  }
  
  /**
   * Load pending operations from storage
   */
  private loadPendingOperations(): void {
    try {
      const stored = storageManager.getItem<SyncOperation[]>('pendingOperations', []);
      if (stored) {
        this.pendingOperations = stored;
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
      this.pendingOperations = [];
    }
  }
  
  /**
   * Save pending operations to storage
   */
  private savePendingOperations(): void {
    try {
      storageManager.setItem('pendingOperations', this.pendingOperations);
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }
  
  /**
   * Perform the sync operation
   */
  sync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || !this.hasPendingOperations()) {
      return Promise.resolve();
    }
    
    this.syncInProgress = true;
    
    return new Promise<void>((resolve) => {
      // Process operations in order of timestamp
      const operations = this.pendingOperations
        .filter(op => !op.synced)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Process each operation
      Promise.all(operations.map(op => this.processOperation(op)))
        .finally(() => {
          this.syncInProgress = false;
          this.savePendingOperations();
          resolve();
        });
    });
  }
  
  /**
   * Process a single operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    try {
      // Here we would typically send the operation to a server API
      // For now, we'll just mark it as synced after a brief delay
      // to simulate network activity
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mark the operation as synced
      const index = this.pendingOperations.findIndex(op => op.id === operation.id);
      if (index !== -1) {
        this.pendingOperations[index].synced = true;
      }
      
      console.log(`Synced operation: ${operation.type} ${operation.entity}`);
    } catch (error) {
      console.error(`Error syncing operation ${operation.id}:`, error);
      // Operation will remain unsynced and be retried later
    }
  }
  
  /**
   * Register a listener for sync events
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
  
  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

// Create default instance
export const syncManager = new SyncManager();
