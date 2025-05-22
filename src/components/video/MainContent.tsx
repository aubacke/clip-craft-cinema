
import React from 'react';
import VideoGallery from '@/components/VideoGallery';
import { Button } from '@/components/ui/button';
import { ReferenceImageDisplay } from './ReferenceImageDisplay';
import { VideoPagination } from './VideoPagination';
import { Video, Folder } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MainContentProps {
  selectedFolderReferenceImage: { dataUrl: string } | null;
  showGenerator: boolean;
  setShowGenerator: (show: boolean) => void;
  handleVideoCreated: (video: Video) => void;
  videos: Video[];
  folders: Folder[];
  selectedFolderId: string | null;
  handleDeleteVideo: (id: string) => void;
  handleMoveVideoToFolder: (videoId: string, folderId: string | null) => void;
  videoGeneratorComponent?: React.ReactNode;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const MainContent = React.memo<MainContentProps>(({
  selectedFolderReferenceImage,
  showGenerator,
  setShowGenerator,
  handleVideoCreated,
  videos,
  folders,
  selectedFolderId,
  handleDeleteVideo,
  handleMoveVideoToFolder,
  videoGeneratorComponent,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  isLoading = false
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-140px)]">
      <div className="pr-4">
        <ReferenceImageDisplay referenceImage={selectedFolderReferenceImage} />
        
        {showGenerator ? (
          <div className="max-w-2xl mx-auto mb-8">
            {videoGeneratorComponent}
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
          isLoading={isLoading}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <VideoPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </ScrollArea>
  );
});

MainContent.displayName = 'MainContent';

export { MainContent };
