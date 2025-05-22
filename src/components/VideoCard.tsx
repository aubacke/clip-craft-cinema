
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Folder, 
  Trash2, 
  Image, 
  Loader2, 
  Play, 
  AlertCircle, 
  Clock, 
  Download 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Video, Folder as FolderType } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [isDownloading, setIsDownloading] = useState(false);
  
  const modelName = VIDEO_MODELS.find(m => m.id === video.modelId)?.name || video.modelId;
  
  // Check if this video has a reference image folder
  const hasReferenceImage = !!video.referenceImageId;
  const referenceFolder = video.folderId ? folders.find(f => f.id === video.folderId && f.isReferenceFolder) : null;
  
  const getStatusBadge = () => {
    switch(video.status) {
      case 'processing':
        return (
          <Badge variant="secondary" className="flex items-center gap-1 absolute top-2 left-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Generating</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1 absolute top-2 left-2">
            <Play className="h-3 w-3" />
            <span>Ready</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1 absolute top-2 left-2">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 absolute top-2 left-2">
            <Clock className="h-3 w-3" />
            <span>Unknown</span>
          </Badge>
        );
    }
  };

  const handleDownload = async () => {
    if (!video.url || video.status !== 'completed') return;
    
    try {
      setIsDownloading(true);
      const response = await fetch(video.url);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download completed!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download video');
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <Card className={cn(
      "glass-card overflow-hidden transition-all duration-300 hover:shadow-lg animate-fade-in",
      video.status === 'failed' && "border-destructive/50"
    )}>
      <div className="relative aspect-video bg-muted">
        {getStatusBadge()}
        
        {video.status === 'processing' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div className="animate-pulse text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <div>Generating...</div>
            </div>
          </div>
        ) : video.status === 'failed' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 text-destructive-foreground">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">Generation Failed</p>
              <p className="text-xs mt-1">{video.error || "Unknown error occurred"}</p>
            </div>
          </div>
        ) : video.url ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                <div className="animate-pulse text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <div>Loading video...</div>
                </div>
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
          
          <div className="flex items-center">
            {video.status === 'completed' && video.url && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 mr-1 hover:bg-primary/20"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            )}
            
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
                
                {folders
                  .filter(folder => !folder.isReferenceFolder || folder.id === video.folderId)
                  .map(folder => (
                    <DropdownMenuItem 
                      key={folder.id}
                      onClick={() => onMoveToFolder(video.id, folder.id)}
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
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          {format(new Date(video.createdAt), 'PPP p')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default VideoCard;
