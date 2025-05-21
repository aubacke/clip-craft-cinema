
import React from 'react';
import { VideoGeneratorCard } from '@/components/video-generator';
import { Video } from '@/lib/types';

interface VideoGeneratorProps {
  onVideoCreated: (video: Video) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onVideoCreated }) => {
  return <VideoGeneratorCard onVideoCreated={onVideoCreated} />;
};

export default VideoGenerator;
