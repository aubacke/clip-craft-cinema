
import React, { Suspense, lazy } from 'react';
import Sidebar from '@/components/Sidebar';
import { PageHeader } from '@/components/video/PageHeader';
import { MainContent } from '@/components/video/MainContent';
import { useVideoManager } from '@/hooks/useVideoManager';

// Lazy load the VideoGenerator component
const LazyVideoGenerator = lazy(() => import('@/components/VideoGenerator'));

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
  
  // Use a memoized component for VideoGenerator with suspense
  const renderVideoGenerator = showGenerator ? (
    <Suspense fallback={<div className="p-4 text-center">Loading video generator...</div>}>
      <LazyVideoGenerator onVideoCreated={handleVideoCreated} />
    </Suspense>
  ) : null;
  
  // Handler for navigating to processing videos
  const handleNavigateToProcessing = () => {
    // This would be implemented to filter/show processing videos
    console.log("Navigate to processing videos");
    // Could implement: setSelectedFilter('processing');
  };
  
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
            onClickProcessing={handleNavigateToProcessing}
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
            videoGeneratorComponent={renderVideoGenerator}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
