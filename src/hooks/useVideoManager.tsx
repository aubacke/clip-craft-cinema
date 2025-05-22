import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Video, Folder } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useVideoPolling } from '@/hooks/useVideoPolling';
import { 
  saveVideoToLocalStorage, 
  getVideosFromLocalStorage, 
  deleteVideoFromLocalStorage 
} from '@/services/video/storageService';
import {
  saveFolderToLocalStorage,
  getFoldersFromLocalStorage,
  moveVideoToFolder
} from '@/services/video/folderService';
import {
  getReferenceImagesFromLocalStorage,
  getReferenceImageByFolderId
} from '@/services/video/referenceImageService';
import { toast } from 'sonner';
import React from 'react';

// Wrap local storage operations with error handling
const safeLocalStorageOperation = <T,>(operation: () => T, fallback: T): T => {
  try {
    return operation();
  } catch (error) {
    console.error("LocalStorage operation failed:", error);
    toast.error("Storage operation failed. Your data may not be saved.");
    return fallback;
  }
};

export const useVideoManager = () => {
  // Data state
  const [videos, setVideos] = useState<Video[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<any[]>([]);
  
  // UI state
  const [uiState, setUiState] = useState({
    showGenerator: true,
    sidebarOpen: false,
    isLoading: false
  });
  
  // Keep track of mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Safe state setter functions
  const safeSetVideos = useCallback((videosOrUpdater: Video[] | ((prev: Video[]) => Video[])) => {
    if (!isMounted.current) return;
    setVideos(videosOrUpdater);
  }, []);
  
  // Load data from local storage
  useEffect(() => {
    safeLocalStorageOperation(() => {
      safeSetVideos(getVideosFromLocalStorage());
      setFolders(getFoldersFromLocalStorage());
      setReferenceImages(getReferenceImagesFromLocalStorage());
    }, undefined);
    
    // Cleanup function to handle component unmount
    return () => {
      isMounted.current = false;
    };
  }, [safeSetVideos]);
  
  // Use the video polling hook to update video statuses
  const updatedVideos = useVideoPolling(videos);
  
  // Update videos when polling gives us updates
  useEffect(() => {
    safeSetVideos(updatedVideos);
  }, [updatedVideos, safeSetVideos]);
  
  // Computed properties with useMemo with stable dependencies
  const processingVideosCount = useMemo(() => 
    videos.filter(video => video.status === 'processing').length, 
    [videos]
  );
  
  const completedVideosCount = useMemo(() => 
    videos.filter(video => video.status === 'completed').length,
    [videos]
  );
  
  const failedVideosCount = useMemo(() => 
    videos.filter(video => video.status === 'failed').length,
    [videos]
  );
  
  // Get the current folder's reference image if applicable
  const selectedFolderReferenceImage = useMemo(() => 
    selectedFolderId ? safeLocalStorageOperation(
      () => getReferenceImageByFolderId(selectedFolderId), 
      null
    ) : null,
    [selectedFolderId]
  );
  
  // Filtered videos based on selected folder - optimized computation
  const filteredVideos = useMemo(() => {
    if (selectedFolderId) {
      return videos.filter(video => video.folderId === selectedFolderId);
    }
    return videos.filter(video => !video.folderId);
  }, [videos, selectedFolderId]);
  
  // Handler functions with useCallback and proper dependencies
  const handleVideoCreated = useCallback((video: Video) => {
    safeSetVideos(prevVideos => [...prevVideos, video]);
    
    safeLocalStorageOperation(() => {
      saveVideoToLocalStorage(video);
    }, undefined);
    
    setUiState(prev => ({ ...prev, showGenerator: false }));
  }, [safeSetVideos]);
  
  const handleDeleteVideo = useCallback((id: string) => {
    safeSetVideos(prev => prev.filter(v => v.id !== id));
    
    safeLocalStorageOperation(() => {
      deleteVideoFromLocalStorage(id);
    }, undefined);
    
    toast.success("Video deleted");
  }, [safeSetVideos]);
  
  const handleCreateFolder = useCallback((name: string) => {
    const newFolder = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    
    safeLocalStorageOperation(() => {
      saveFolderToLocalStorage(newFolder);
    }, undefined);
    
    toast.success(`Folder "${name}" created`);
  }, []);
  
  const handleMoveVideoToFolder = useCallback((videoId: string, folderId: string | null) => {
    safeSetVideos(prev => 
      prev.map(v => 
        v.id === videoId ? { ...v, folderId: folderId || undefined } : v
      )
    );
    
    safeLocalStorageOperation(() => {
      moveVideoToFolder(videoId, folderId);
    }, undefined);
    
    const folderName = folderId 
      ? folders.find(f => f.id === folderId)?.name 
      : "All Videos";
    
    toast.success(`Video moved to ${folderName}`);
  }, [safeSetVideos, folders]);
  
  // UI state handlers with useCallback
  const toggleSidebar = useCallback(() => {
    setUiState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);
  
  const closeSidebar = useCallback(() => {
    setUiState(prev => ({ ...prev, sidebarOpen: false }));
  }, []);
  
  const showGeneratorPanel = useCallback(() => {
    setUiState(prev => ({ ...prev, showGenerator: true }));
  }, []);
  
  const hideGeneratorPanel = useCallback(() => {
    setUiState(prev => ({ ...prev, showGenerator: false }));
  }, []);
  
  const toggleGeneratorPanel = useCallback(() => {
    setUiState(prev => ({ ...prev, showGenerator: !prev.showGenerator }));
  }, []);
  
  return {
    // Data
    videos,
    folders,
    selectedFolderId,
    filteredVideos,
    referenceImages,
    selectedFolderReferenceImage,
    
    // UI State
    ...uiState,
    
    // Actions - Data
    handleVideoCreated,
    handleDeleteVideo,
    handleCreateFolder,
    handleMoveVideoToFolder,
    setSelectedFolderId,
    
    // Actions - UI
    toggleSidebar,
    closeSidebar,
    showGeneratorPanel, 
    hideGeneratorPanel,
    toggleGeneratorPanel,
    
    // Stats
    processingVideosCount,
    completedVideosCount,
    failedVideosCount
  };
};

// Export a memoized version for additional performance
export const MemoizedVideoManager = React.memo(useVideoManager);
