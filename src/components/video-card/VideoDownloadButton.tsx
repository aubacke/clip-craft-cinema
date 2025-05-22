
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface VideoDownloadButtonProps {
  url: string | undefined;
  videoId: string;
  status: string;
}

export const VideoDownloadButton: React.FC<VideoDownloadButtonProps> = ({ url, videoId, status }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    // Only allow download for completed videos with a URL
    if (!url || status !== 'completed') return;
    
    try {
      setIsDownloading(true);
      toast.loading('Starting download...', { id: 'download' });
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorMessage = `Failed to download: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `video-${videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      toast.success('Download completed!', { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      let errorMessage = 'Failed to download video';
      
      // More specific error messages based on error type
      if (error instanceof TypeError && error.message.includes('network')) {
        errorMessage = 'Network error while downloading. Please check your connection.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'download' });
    } finally {
      setIsDownloading(false);
    }
  };

  // Only show download button for completed videos with a URL
  if (status !== 'completed' || !url) {
    return null;
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 mr-1 hover:bg-primary/20"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-label="Download video"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
};
