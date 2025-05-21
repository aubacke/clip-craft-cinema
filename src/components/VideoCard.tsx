
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Folder, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Video, Folder as FolderType } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';

interface VideoCardProps {
  video: Video;
  onDelete: (id: string) => void;
  onMoveToFolder: (videoId: string, folderId: string | null) => void;
  folders: FolderType[];
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onDelete,
  onMoveToFolder,
  folders
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  const modelName = VIDEO_MODELS.find(m => m.id === video.modelId)?.name || video.modelId;
  
  return (
    <Card className="glass-card overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {video.status === 'processing' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div className="animate-pulse-gentle">Generating...</div>
          </div>
        ) : video.status === 'failed' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 text-destructive-foreground">
            <div className="text-center p-4">
              <p className="font-medium">Generation Failed</p>
              <p className="text-xs mt-1">{video.error || "Unknown error occurred"}</p>
            </div>
          </div>
        ) : video.url ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                <div className="animate-pulse-gentle">Loading video...</div>
              </div>
            )}
            <video
              src={video.url}
              className="w-full h-full object-cover"
              controls
              autoPlay={false}
              loop
              muted
              onLoadedData={() => setIsLoading(false)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div>No video available</div>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <p className="font-medium leading-snug line-clamp-2">{video.prompt}</p>
            <p className="text-xs text-muted-foreground mt-1">{modelName}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(video.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onMoveToFolder(video.id, null)}>
                <Folder className="mr-2 h-4 w-4" />
                Move to All Videos
              </DropdownMenuItem>
              
              {folders.map(folder => (
                <DropdownMenuItem 
                  key={folder.id}
                  onClick={() => onMoveToFolder(video.id, folder.id)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Move to {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          {new Date(video.createdAt).toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
