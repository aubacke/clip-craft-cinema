
import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface VideoCardMediaProps {
  status: 'processing' | 'completed' | 'failed' | string;
  url?: string;
  error?: string;
}

export const VideoCardMedia: React.FC<VideoCardMediaProps> = ({ status, url, error }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-video bg-muted">
      <StatusBadge status={status} error={error} />
      
      {status === 'processing' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
          <div className="animate-pulse text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <div>Generating...</div>
          </div>
        </div>
      ) : status === 'failed' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 text-destructive-foreground">
          <div className="text-center p-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Generation Failed</p>
            <p className="text-xs mt-1">{error || "Unknown error occurred"}</p>
          </div>
        </div>
      ) : url ? (
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
            src={url}
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
  );
};
