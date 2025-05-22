
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  
  // Load data from local storage
  useEffect(() => {
    setVideos(getVideosFromLocalStorage());
    setFolders(getFoldersFromLocalStorage());
    setReferenceImages(getReferenceImagesFromLocalStorage());
  }, []);
  
  // Use the video polling hook to update video statuses
  const updatedVideos = useVideoPolling(videos);
  
  // Update videos when polling gives us updates
  useEffect(() => {
    setVideos(updatedVideos);
  }, [updatedVideos]);
  
  // Computed properties with useMemo
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
    selectedFolderId ? getReferenceImageByFolderId(selectedFolderId) : null,
    [selectedFolderId]
  );
  
  // Filtered videos based on selected folder
  const filteredVideos = useMemo(() => 
    selectedFolderId
      ? videos.filter(video => video.folderId === selectedFolderId)
      : videos.filter(video => !video.folderId),
    [videos, selectedFolderId]
  );
  
  // Handler functions with useCallback
  const handleVideoCreated = useCallback((video: Video) => {
    const newVideos = [...videos, video];
    setVideos(newVideos);
    saveVideoToLocalStorage(video);
    setUiState(prev => ({ ...prev, showGenerator: false }));
  }, [videos]);
  
  const handleDeleteVideo = useCallback((id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    deleteVideoFromLocalStorage(id);
    toast.success("Video deleted");
  }, []);
  
  const handleCreateFolder = useCallback((name: string) => {
    const newFolder = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    saveFolderToLocalStorage(newFolder);
    toast.success(`Folder "${name}" created`);
  }, []);
  
  const handleMoveVideoToFolder = useCallback((videoId: string, folderId: string | null) => {
    setVideos(prev => 
      prev.map(v => 
        v.id === videoId ? { ...v, folderId: folderId || undefined } : v
      )
    );
    
    moveVideoToFolder(videoId, folderId);
    
    const folderName = folderId 
      ? folders.find(f => f.id === folderId)?.name 
      : "All Videos";
    
    toast.success(`Video moved to ${folderName}`);
  }, [folders]);
  
  // UI state handlers with useCallback
  const toggleSidebar = useCallback(() => {
    setUiState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);
  
  const closeSidebar = useCallback(() => {
    setUiState(prev => ({ ...prev, sidebarOpen: false }));
  }, []);
  
  const showGeneratorPanel = useCallback(() => {
    setUiState(prev => ({ ...prev, showGenerator: true }));
    closeSidebar();
  }, [closeSidebar]);
  
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
