
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageHeader } from '@/components/video/PageHeader';
import { MainContent } from '@/components/video/MainContent';
import { v4 as uuidv4 } from 'uuid';
import { Video, Folder } from '@/lib/types';
import { toast } from 'sonner';
import {
  saveVideoToLocalStorage,
  getVideosFromLocalStorage,
  deleteVideoFromLocalStorage,
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
import { useVideoPolling } from '@/hooks/useVideoPolling';

const Index = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  const [referenceImages, setReferenceImages] = useState<any[]>([]);
  
  // Load data from local storage
  useEffect(() => {
    setVideos(getVideosFromLocalStorage());
    setFolders(getFoldersFromLocalStorage());
    setReferenceImages(getReferenceImagesFromLocalStorage());
  }, []);
  
  // Use the video polling hook
  const updatedVideos = useVideoPolling(videos);
  
  // Update videos when polling gives us updates
  useEffect(() => {
    setVideos(updatedVideos);
  }, [updatedVideos]);
  
  // Handlers
  const handleVideoCreated = (video: Video) => {
    const newVideos = [...videos, video];
    setVideos(newVideos);
    saveVideoToLocalStorage(video);
    setShowGenerator(false);
  };
  
  const handleDeleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    deleteVideoFromLocalStorage(id);
    toast.success("Video deleted");
  };
  
  const handleCreateFolder = (name: string) => {
    const newFolder = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString()
    };
    
    setFolders(prev => [...prev, newFolder]);
    saveFolderToLocalStorage(newFolder);
    toast.success(`Folder "${name}" created`);
  };
  
  const handleMoveVideoToFolder = (videoId: string, folderId: string | null) => {
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
  };
  
  const handleNewVideo = () => {
    setShowGenerator(true);
    setSidebarOpen(false);
  };
  
  // Helper function to get the reference image for a folder
  const selectedFolderReferenceImage = selectedFolderId 
    ? getReferenceImageByFolderId(selectedFolderId)
    : null;
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onNewVideo={handleNewVideo}
      />
      
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-6">
          <PageHeader
            selectedFolderId={selectedFolderId}
            folders={folders}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onCreateNewVideo={handleNewVideo}
            showGenerator={showGenerator}
          />
          
          <MainContent
            selectedFolderReferenceImage={selectedFolderReferenceImage}
            showGenerator={showGenerator}
            setShowGenerator={setShowGenerator}
            handleVideoCreated={handleVideoCreated}
            videos={videos}
            folders={folders}
            selectedFolderId={selectedFolderId}
            handleDeleteVideo={handleDeleteVideo}
            handleMoveVideoToFolder={handleMoveVideoToFolder}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
