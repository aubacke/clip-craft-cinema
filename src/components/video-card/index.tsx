
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Video, Folder as FolderType } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Image } from 'lucide-react';
import { VideoCardMedia } from './VideoCardMedia';
import { VideoCardActions } from './VideoCardActions';

interface VideoCardProps {
  video: Video;
  onDelete: (id: string) => void;
  onMoveToFolder: (videoId: string, folderId: string | null) => void;
  folders: FolderType[];
}

const VideoCard = React.memo<VideoCardProps>(({
  video,
  onDelete,
  onMoveToFolder,
  folders
}) => {
  const modelName = VIDEO_MODELS.find(m => m.id === video.modelId)?.name || video.modelId;
  
  // Check if this video has a reference image folder
  const referenceFolder = video.folderId 
    ? folders.find(f => f.id === video.folderId && f.isReferenceFolder) 
    : null;
  
  return (
    <Card className={cn(
      "glass-card overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in",
      video.status === 'failed' && "border-destructive/50"
    )}>
      <VideoCardMedia 
        status={video.status}
        url={video.url}
        error={video.error}
      />
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <p className="font-medium leading-snug line-clamp-2">{video.prompt}</p>
            <div className="flex items-center mt-1">
              <p className="text-xs text-muted-foreground">{modelName}</p>
              {referenceFolder && (
                <div className="flex items-center ml-2 text-xs text-muted-foreground">
                  <Image className="h-3 w-3 mr-1" />
                  <span>Reference image</span>
                </div>
              )}
            </div>
          </div>
          
          <VideoCardActions 
            video={video}
            onDelete={onDelete}
            onMoveToFolder={onMoveToFolder}
            folders={folders}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          {format(new Date(video.createdAt), 'PPP p')}
        </div>
      </CardFooter>
    </Card>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;
