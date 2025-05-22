
import React from 'react';
import VideoGenerator from '@/components/VideoGenerator';
import VideoGallery from '@/components/VideoGallery';
import { Button } from '@/components/ui/button';
import { ReferenceImageDisplay } from './ReferenceImageDisplay';
import { Video, Folder } from '@/lib/types';

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
}

export const MainContent: React.FC<MainContentProps> = ({
  selectedFolderReferenceImage,
  showGenerator,
  setShowGenerator,
  handleVideoCreated,
  videos,
  folders,
  selectedFolderId,
  handleDeleteVideo,
  handleMoveVideoToFolder
}) => {
  // Get videos filtered by the selected folder
  const filteredVideos = selectedFolderId
    ? videos.filter(video => video.folderId === selectedFolderId)
    : videos.filter(video => !video.folderId);

  return (
    <>
      <ReferenceImageDisplay referenceImage={selectedFolderReferenceImage} />
      
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
        videos={filteredVideos}
        folders={folders}
        selectedFolderId={selectedFolderId}
        onDeleteVideo={handleDeleteVideo}
        onMoveVideoToFolder={handleMoveVideoToFolder}
      />
    </>
  );
}
