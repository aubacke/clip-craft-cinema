
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoGenerationParameters } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';
import { VideoGeneratorForm } from './VideoGeneratorForm';

interface VideoGeneratorCardProps {
  onVideoCreated: (video: any) => void;
}

export const VideoGeneratorCard: React.FC<VideoGeneratorCardProps> = ({ onVideoCreated }) => {
  const [selectedModelId, setSelectedModelId] = useState(VIDEO_MODELS[0].id);
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState<VideoGenerationParameters>({
    prompt: '',
  });
  
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    setParameters(prev => ({ ...prev, prompt: newPrompt }));
  };
  
  const handleParameterChange = (newParams: VideoGenerationParameters) => {
    setParameters(newParams);
    // Sync prompt state if it's changed via parameters
    if (newParams.prompt && newParams.prompt !== prompt) {
      setPrompt(newParams.prompt);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Video</CardTitle>
      </CardHeader>
      <CardContent>
        <VideoGeneratorForm 
          prompt={prompt}
          onPromptChange={handlePromptChange}
          selectedModelId={selectedModelId}
          onModelSelect={setSelectedModelId}
          parameters={parameters}
          onParameterChange={handleParameterChange}
          onVideoCreated={onVideoCreated}
        />
      </CardContent>
    </Card>
  );
};
