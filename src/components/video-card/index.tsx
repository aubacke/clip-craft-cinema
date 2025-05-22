
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from '@/components/ui/hover-card';
import { Video, Folder as FolderType } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Image, Clock, CalendarIcon, ArrowUpRightFromCircle } from 'lucide-react';
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
  const [isHovering, setIsHovering] = useState(false);
  
  // Memoized values
  const modelName = useMemo(() => 
    VIDEO_MODELS.find(m => m.id === video.modelId)?.name || video.modelId,
    [video.modelId]
  );
  
  const createdAt = useMemo(() => new Date(video.createdAt), [video.createdAt]);
  
  // Memoized reference folder check
  const referenceFolder = useMemo(() => 
    video.folderId 
      ? folders.find(f => f.id === video.folderId && f.isReferenceFolder) 
      : null,
    [video.folderId, folders]
  );
  
  // Event handlers with useCallback
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);
  
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card 
          className={cn(
            "glass-card overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in",
            video.status === 'failed' && "border-destructive/50",
            isHovering && "scale-[1.02] shadow-xl"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
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
              {format(createdAt, 'PPP p')}
            </div>
          </CardFooter>
        </Card>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80 p-0">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Video Details</h3>
          
          <div className="space-y-2 text-sm">
            <p className="leading-snug">{video.prompt}</p>
            
            <div className="flex items-center text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Created: {format(createdAt, 'PPP')}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              <span>Time: {format(createdAt, 'p')}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <ArrowUpRightFromCircle className="h-3.5 w-3.5 mr-1.5" />
              <span>Model: {modelName}</span>
            </div>
            
            {referenceFolder && (
              <div className="flex items-center text-muted-foreground">
                <Image className="h-3.5 w-3.5 mr-1.5" />
                <span>Uses reference image</span>
              </div>
            )}
          </div>
        </div>
        
        {video.status === 'completed' && video.url && (
          <div className="border-t p-2 bg-accent/30">
            <p className="text-xs text-center">Hover over video for playback controls</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;
