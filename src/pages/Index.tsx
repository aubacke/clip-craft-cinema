
import React, { useState, useEffect } from 'react';
import VideoGenerator from '@/components/VideoGenerator';
import VideoGallery from '@/components/VideoGallery';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Video, Folder } from '@/lib/types';
import { toast } from 'sonner';
import {
  saveVideoToLocalStorage,
  getVideosFromLocalStorage,
  deleteVideoFromLocalStorage,
  saveFolderToLocalStorage,
  getFoldersFromLocalStorage,
  moveVideoToFolder,
  checkVideoPredictionStatus
} from '@/services/videoApi';

const Index = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  
  // Load data from local storage
  useEffect(() => {
    setVideos(getVideosFromLocalStorage());
    setFolders(getFoldersFromLocalStorage());
  }, []);
  
  // Poll for video status updates
  useEffect(() => {
    const processingVideos = videos.filter(v => v.status === 'processing');
    
    if (processingVideos.length === 0) return;
    
    const intervalId = setInterval(async () => {
      for (const video of processingVideos) {
        try {
          const updatedVideo = await checkVideoPredictionStatus(video.id);
          
          if (updatedVideo.status !== 'processing') {
            setVideos(prev => 
              prev.map(v => 
                v.id === video.id ? updatedVideo : v
              )
            );
            
            saveVideoToLocalStorage(updatedVideo);
            
            if (updatedVideo.status === 'completed') {
              toast.success(`Video "${truncateText(video.prompt, 20)}" is ready!`);
            } else if (updatedVideo.status === 'failed') {
              toast.error(`Video generation failed: ${updatedVideo.error || 'Unknown error'}`);
            }
          }
        } catch (error) {
          console.error(`Error checking video ${video.id} status:`, error);
        }
      }
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [videos]);
  
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
  
  // Helper functions
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
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
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <h1 className="text-2xl font-bold ml-2 md:ml-0">
              {selectedFolderId 
                ? `Folder: ${folders.find(f => f.id === selectedFolderId)?.name}`
                : 'All Videos'}
            </h1>
            
            <div className="flex gap-2">
              {!showGenerator && (
                <Button onClick={() => setShowGenerator(true)}>
                  Create New Video
                </Button>
              )}
            </div>
          </div>
          
          {showGenerator ? (
            <div className="max-w-2xl mx-auto mb-8">
              <VideoGenerator 
                onVideoCreated={handleVideoCreated}
              />
            </div>
          ) : (
            <div className="mb-6">
              <Button variant="link" onClick={() => setShowGenerator(true)}>
                + Generate another video
              </Button>
            </div>
          )}
          
          <VideoGallery
            videos={videos}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onDeleteVideo={handleDeleteVideo}
            onMoveVideoToFolder={handleMoveVideoToFolder}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
