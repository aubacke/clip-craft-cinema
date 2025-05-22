
import React, { useCallback } from 'react';
import { 
  MoreVertical, 
  Folder, 
  Trash2, 
  Image 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VideoDownloadButton } from './VideoDownloadButton';
import { Video, Folder as FolderType } from '@/lib/types';

interface VideoCardActionsProps {
  video: Video;
  onDelete: (id: string) => void;
  onMoveToFolder: (videoId: string, folderId: string | null) => void;
  folders: FolderType[];
}

export const VideoCardActions = React.memo<VideoCardActionsProps>(({
  video,
  onDelete,
  onMoveToFolder,
  folders
}) => {
  // Use useCallback to memoize handlers
  const handleDelete = useCallback(() => {
    onDelete(video.id);
  }, [onDelete, video.id]);
  
  const handleMoveToAllVideos = useCallback(() => {
    onMoveToFolder(video.id, null);
  }, [onMoveToFolder, video.id]);
  
  // Create a factory function for folder moves
  const handleMoveToFolder = useCallback((folderId: string) => {
    return () => onMoveToFolder(video.id, folderId);
  }, [onMoveToFolder, video.id]);

  return (
    <div className="flex items-center">
      <VideoDownloadButton 
        url={video.url} 
        videoId={video.id} 
        status={video.status}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleMoveToAllVideos}>
            <Folder className="mr-2 h-4 w-4" />
            Move to All Videos
          </DropdownMenuItem>
          
          {folders
            .filter(folder => !folder.isReferenceFolder || folder.id === video.folderId)
            .map(folder => (
              <DropdownMenuItem 
                key={folder.id}
                onClick={handleMoveToFolder(folder.id)}
              >
                {folder.isReferenceFolder ? (
                  <Image className="mr-2 h-4 w-4" />
                ) : (
                  <Folder className="mr-2 h-4 w-4" />
                )}
                Move to {folder.name}
              </DropdownMenuItem>
            ))
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

VideoCardActions.displayName = 'VideoCardActions';
