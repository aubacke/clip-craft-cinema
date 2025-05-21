
import React from 'react';
import VideoCard from './VideoCard';
import { Video, Folder } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VideoGalleryProps {
  videos: Video[];
  folders: Folder[];
  selectedFolderId: string | null;
  onDeleteVideo: (id: string) => void;
  onMoveVideoToFolder: (videoId: string, folderId: string | null) => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  folders,
  selectedFolderId,
  onDeleteVideo,
  onMoveVideoToFolder,
}) => {
  const filteredVideos = selectedFolderId
    ? videos.filter(video => video.folderId === selectedFolderId)
    : videos.filter(video => !video.folderId);

  if (filteredVideos.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>No videos in this folder yet.</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-6",
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    )}>
      {filteredVideos.map(video => (
        <VideoCard
          key={video.id}
          video={video}
          onDelete={onDeleteVideo}
          onMoveToFolder={onMoveVideoToFolder}
          folders={folders}
        />
      ))}
    </div>
  );
};

export default VideoGallery;
