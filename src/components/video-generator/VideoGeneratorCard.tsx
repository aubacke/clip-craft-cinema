
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoGenerationParameters } from '@/lib/types';
import { VIDEO_MODELS, DEFAULT_MODEL_ID } from '@/lib/constants';
import { VideoGeneratorForm } from './VideoGeneratorForm';

interface VideoGeneratorCardProps {
  onVideoCreated: (video: any) => void;
}

export const VideoGeneratorCard = React.memo<VideoGeneratorCardProps>(({ onVideoCreated }) => {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID || VIDEO_MODELS[0].id);
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState<VideoGenerationParameters>({
    prompt: '',
  });
  
  const handlePromptChange = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    // Update parameters.prompt to keep them in sync
    setParameters(prev => ({ ...prev, prompt: newPrompt }));
  }, []);
  
  const handleParameterChange = useCallback((newParams: VideoGenerationParameters) => {
    setParameters(newParams);
    // Sync prompt state if it's changed via parameters
    if (newParams.prompt !== undefined && newParams.prompt !== prompt) {
      setPrompt(newParams.prompt);
    }
  }, [prompt]);
  
  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId);
  }, []);
  
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
          onModelSelect={handleModelSelect}
          parameters={parameters}
          onParameterChange={handleParameterChange}
          onVideoCreated={onVideoCreated}
        />
      </CardContent>
    </Card>
  );
});

VideoGeneratorCard.displayName = 'VideoGeneratorCard';

export { VideoGeneratorCard };
