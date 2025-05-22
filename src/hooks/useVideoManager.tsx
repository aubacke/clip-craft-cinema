import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Video, Folder } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useVideoPolling } from '@/hooks/useVideoPolling';
import { 
  saveVideoToLocalStorage, 
  getVideosFromLocalStorage,
  getPaginatedVideos,
  deleteVideoFromLocalStorage 
} from '@/services/video/storageService';
import {
  saveFolderToLocalStorage,
  getFoldersFromLocalStorage,
  moveVideoToFolder,
  deleteFolder
} from '@/services/video/folderService';
import {
  getReferenceImagesFromLocalStorage,
  getReferenceImageByFolderId
} from '@/services/video/referenceImageService';
import { storageManager } from '@/services/storage/storageManager';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Pagination settings
const DEFAULT_PAGE_SIZE = 12;

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  
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
  
  // Use React Query to manage video data with caching and pagination
  const { data: paginatedData, refetch: refetchVideos } = useQuery({
    queryKey: ['videos', currentPage, pageSize, selectedFolderId],
    queryFn: () => getPaginatedVideos(currentPage, pageSize, selectedFolderId),
    initialData: { videos: [], totalPages: 0, totalCount: 0 },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });
  
  // Update videos when pagination data changes
  useEffect(() => {
    if (paginatedData) {
      safeSetVideos(paginatedData.videos);
      setTotalPages(paginatedData.totalPages);
      setTotalVideos(paginatedData.totalCount);
    }
  }, [paginatedData, safeSetVideos]);
  
  // Load folders and reference images on mount
  useEffect(() => {
    safeLocalStorageOperation(() => {
      setFolders(getFoldersFromLocalStorage());
      setReferenceImages(getReferenceImagesFromLocalStorage());
    }, undefined);
    
    // Cleanup function to handle component unmount
    return () => {
      isMounted.current = false;
      // Flush any pending storage operations
      storageManager.flushAll();
    };
  }, []);
  
  // Use the video polling hook to update video statuses
  const updatedVideos = useVideoPolling(getVideosFromLocalStorage());
  
  // When polling gives us updates, refresh our query
  useEffect(() => {
    if (updatedVideos.length > 0) {
      refetchVideos();
    }
  }, [updatedVideos, refetchVideos]);
  
  // Computed properties with useMemo with stable dependencies
  const processingVideosCount = useMemo(() => 
    updatedVideos.filter(video => video.status === 'processing').length, 
    [updatedVideos]
  );
  
  const completedVideosCount = useMemo(() => 
    updatedVideos.filter(video => video.status === 'completed').length,
    [updatedVideos]
  );
  
  const failedVideosCount = useMemo(() => 
    updatedVideos.filter(video => video.status === 'failed').length,
    [updatedVideos]
  );
  
  // Get the current folder's reference image if applicable
  const selectedFolderReferenceImage = useMemo(() => 
    selectedFolderId ? safeLocalStorageOperation(
      () => getReferenceImageByFolderId(selectedFolderId), 
      null
    ) : null,
    [selectedFolderId]
  );
  
  // Handler functions with useCallback and proper dependencies
  const handleVideoCreated = useCallback((video: Video) => {
    safeLocalStorageOperation(() => {
      saveVideoToLocalStorage(video);
      refetchVideos();
    }, undefined);
    
    setUiState(prev => ({ ...prev, showGenerator: false }));
    
    toast.success("Video created and being processed");
  }, [refetchVideos]);
  
  const handleDeleteVideo = useCallback((id: string) => {
    safeLocalStorageOperation(() => {
      deleteVideoFromLocalStorage(id);
      refetchVideos();
    }, undefined);
    
    toast.success("Video deleted");
  }, [refetchVideos]);
  
  const handleCreateFolder = useCallback((name: string) => {
    const newFolder = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString()
    };
    
    safeLocalStorageOperation(() => {
      saveFolderToLocalStorage(newFolder);
      setFolders(prev => [...prev, newFolder]);
    }, undefined);
    
    toast.success(`Folder "${name}" created`);
  }, []);
  
  const handleMoveVideoToFolder = useCallback((videoId: string, folderId: string | null) => {
    safeLocalStorageOperation(() => {
      moveVideoToFolder(videoId, folderId);
      refetchVideos();
    }, undefined);
    
    const folderName = folderId 
      ? folders.find(f => f.id === folderId)?.name 
      : "All Videos";
    
    toast.success(`Video moved to ${folderName}`);
  }, [folders, refetchVideos]);
  
  const handleDeleteFolder = useCallback((folderId: string, moveVideosTo: string | null = null) => {
    safeLocalStorageOperation(() => {
      deleteFolder(folderId, moveVideosTo);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      
      refetchVideos();
    }, undefined);
    
    const folderName = folders.find(f => f.id === folderId)?.name;
    toast.success(`Folder "${folderName}" deleted`);
  }, [folders, selectedFolderId, refetchVideos]);
  
  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);
  
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
    referenceImages,
    selectedFolderReferenceImage,
    
    // Pagination
    currentPage,
    pageSize,
    totalPages,
    totalVideos,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    
    // UI State
    ...uiState,
    
    // Actions - Data
    handleVideoCreated,
    handleDeleteVideo,
    handleCreateFolder,
    handleMoveVideoToFolder,
    handleDeleteFolder,
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
