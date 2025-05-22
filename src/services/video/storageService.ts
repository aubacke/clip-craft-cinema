
import { Video, Folder } from '@/lib/types';
import { storageManager } from '@/services/storage/storageManager';
import { globalCache } from '@/services/storage/cacheStrategy';
import { getObjectSize } from '@/services/storage/compressionUtils';

// Keys for our storage items
const STORAGE_KEYS = {
  VIDEOS: 'videos',
  FOLDERS: 'folders',
  SETTINGS: 'settings'
};

// In-memory LRU cache for frequently accessed data
const videosCache = globalCache;

// Batch save performance metrics
let totalSaveTime = 0;
let saveOperations = 0;

/**
 * Save a video to storage with optimizations
 */
export const saveVideoToLocalStorage = (video: Video): void => {
  try {
    const startTime = performance.now();
    
    // Get current videos - first from cache, then from storage if needed
    const videos = getVideosFromLocalStorage();
    
    // Update or add the video
    const existingIndex = videos.findIndex(v => v.id === video.id);
    if (existingIndex >= 0) {
      videos[existingIndex] = video;
    } else {
      videos.push(video);
    }
    
    // Update cache immediately
    videosCache.set(STORAGE_KEYS.VIDEOS, videos);
    
    // Save to storage manager (which handles batching and compression)
    storageManager.setItem(STORAGE_KEYS.VIDEOS, videos);
    
    // Track performance
    const endTime = performance.now();
    totalSaveTime += (endTime - startTime);
    saveOperations++;
    
    // Log performance metrics occasionally
    if (saveOperations % 10 === 0) {
      const avgTime = totalSaveTime / saveOperations;
      console.debug(`Average video save time: ${avgTime.toFixed(2)}ms over ${saveOperations} operations`);
    }
  } catch (error) {
    console.error("Error saving video:", error);
  }
};

/**
 * Get videos from storage with caching
 */
export const getVideosFromLocalStorage = (): Video[] => {
  try {
    // Try to get from cache first
    const cachedVideos = videosCache.get(STORAGE_KEYS.VIDEOS);
    if (cachedVideos) {
      return cachedVideos;
    }
    
    // If not in cache, get from storage
    const videos = storageManager.getItem<Video[]>(STORAGE_KEYS.VIDEOS, []);
    
    // Update cache for future reads
    videosCache.set(STORAGE_KEYS.VIDEOS, videos);
    
    return videos;
  } catch (error) {
    console.error("Error getting videos:", error);
    return [];
  }
};

/**
 * Get a paginated subset of videos
 */
export const getPaginatedVideos = (page: number = 1, pageSize: number = 20, folderId?: string): {
  videos: Video[], 
  totalPages: number,
  totalCount: number
} => {
  try {
    const allVideos = getVideosFromLocalStorage();
    
    // Filter by folder if specified
    const filteredVideos = folderId 
      ? allVideos.filter(v => v.folderId === folderId)
      : allVideos.filter(v => !v.folderId);
    
    const totalCount = filteredVideos.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Sort by creation date (newest first)
    const sortedVideos = [...filteredVideos].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Paginate
    const startIndex = (page - 1) * pageSize;
    const paginatedVideos = sortedVideos.slice(startIndex, startIndex + pageSize);
    
    return {
      videos: paginatedVideos,
      totalPages,
      totalCount
    };
  } catch (error) {
    console.error("Error getting paginated videos:", error);
    return { videos: [], totalPages: 0, totalCount: 0 };
  }
};

/**
 * Delete a video from storage
 */
export const deleteVideoFromLocalStorage = (videoId: string): void => {
  try {
    // Get videos from cache if available
    const videos = getVideosFromLocalStorage();
    const newVideos = videos.filter(v => v.id !== videoId);
    
    // Update cache immediately
    videosCache.set(STORAGE_KEYS.VIDEOS, newVideos);
    
    // Update storage
    storageManager.setItem(STORAGE_KEYS.VIDEOS, newVideos);
  } catch (error) {
    console.error("Error deleting video:", error);
  }
};

/**
 * Clear storage cache to force a fresh read
 */
export const clearVideoCache = (): void => {
  videosCache.remove(STORAGE_KEYS.VIDEOS);
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = (): {
  videoCount: number,
  totalSize: number,
  averageSize: number
} => {
  try {
    const videos = getVideosFromLocalStorage();
    const videoCount = videos.length;
    const totalSize = getObjectSize(videos);
    const averageSize = videoCount > 0 ? totalSize / videoCount : 0;
    
    return {
      videoCount,
      totalSize,
      averageSize
    };
  } catch (error) {
    console.error("Error calculating storage stats:", error);
    return { videoCount: 0, totalSize: 0, averageSize: 0 };
  }
};
