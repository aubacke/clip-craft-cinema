
import React from 'react';
import Sidebar from '@/components/Sidebar';
import { PageHeader } from '@/components/video/PageHeader';
import { MainContent } from '@/components/video/MainContent';
import { useVideoManager } from '@/hooks/useVideoManager';

const Index = () => {
  const {
    // Data
    videos,
    folders,
    selectedFolderId,
    filteredVideos,
    selectedFolderReferenceImage,
    
    // UI State
    showGenerator,
    sidebarOpen,
    
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
    
    // Stats
    processingVideosCount,
    completedVideosCount,
  } = useVideoManager();
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onNewVideo={showGeneratorPanel}
      />
      
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-6">
          <PageHeader
            selectedFolderId={selectedFolderId}
            folders={folders}
            onToggleSidebar={toggleSidebar}
            onCreateNewVideo={showGeneratorPanel}
            showGenerator={showGenerator}
            processingVideosCount={processingVideosCount}
            completedVideosCount={completedVideosCount}
          />
          
          <MainContent
            selectedFolderReferenceImage={selectedFolderReferenceImage}
            showGenerator={showGenerator}
            setShowGenerator={showGenerator => showGenerator ? showGeneratorPanel() : null}
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
