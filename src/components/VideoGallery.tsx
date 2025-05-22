
import React, { useMemo } from 'react';
import VideoCard from './VideoCard';
import { Video, Folder } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoGalleryProps {
  videos: Video[];
  folders: Folder[];
  selectedFolderId: string | null;
  onDeleteVideo: (id: string) => void;
  onMoveVideoToFolder: (videoId: string, folderId: string | null) => void;
  isLoading?: boolean;
}

const VideoGallery = React.memo<VideoGalleryProps>(({
  videos,
  folders,
  selectedFolderId,
  onDeleteVideo,
  onMoveVideoToFolder,
  isLoading = false
}) => {
  // Render loading skeletons when loading
  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton 
            key={`skeleton-${index}`} 
            className="w-full h-64 rounded-lg"
          />
        ))}
      </div>
    );
  }
  
  // Show empty state when no videos
  if (videos.length === 0) {
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
      {videos.map(video => (
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
});

VideoGallery.displayName = 'VideoGallery';

export default VideoGallery;
