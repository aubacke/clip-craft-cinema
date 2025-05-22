
import React, { useState, useRef } from 'react';
import { Loader2, AlertCircle, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface VideoCardMediaProps {
  status: 'processing' | 'completed' | 'failed' | string;
  url?: string;
  error?: string;
}

export const VideoCardMedia: React.FC<VideoCardMediaProps> = ({ status, url, error }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className="relative aspect-video bg-muted overflow-hidden rounded-t-md"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover"
            controls={false}
            autoPlay={false}
            loop
            muted={isMuted}
            onLoadedData={() => setIsLoading(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Playback controls overlay that appears on hover */}
          {!isLoading && isHovering && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200">
              <div className="flex gap-4">
                <button 
                  onClick={togglePlay}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors duration-200"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 text-white" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </button>
                <button 
                  onClick={toggleMute}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors duration-200"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? (
                    <VolumeX className="h-6 w-6 text-white" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
          <div>No video available</div>
        </div>
      )}
    </div>
  );
};
