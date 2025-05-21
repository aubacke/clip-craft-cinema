
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ModelSelector } from './ModelSelector';
import { ModelParameters } from './ModelParameters';
import { PromptInput } from './PromptInput';
import { Video } from '@/lib/types';
import { VIDEO_MODELS } from '@/lib/constants';
import { createPrediction } from '@/services/video/predictionService';
import { VideoGenerationParameters } from '@/lib/replicateTypes';

interface VideoGeneratorCardProps {
  onVideoCreated: (video: Video) => void;
}

export const VideoGeneratorCard: React.FC<VideoGeneratorCardProps> = ({ onVideoCreated }) => {
  const [selectedModelId, setSelectedModelId] = useState(VIDEO_MODELS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      setIsGenerating(true);
      
      const videoId = uuidv4();
      const newVideo: Video = {
        id: videoId,
        prompt: prompt.trim(),
        modelId: selectedModelId,
        status: 'processing',
        createdAt: new Date().toISOString(),
        // If this video has a reference image, link it to the reference image folder
        folderId: parameters.referenceImageFolderId,
        referenceImageId: parameters.referenceImageId
      };
      
      onVideoCreated(newVideo);
      
      // Start prediction in the background
      createPrediction(selectedModelId, parameters, videoId)
        .catch(error => console.error("Error creating prediction:", error));
        
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Video</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PromptInput
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Describe the video you want to generate..."
            disabled={isGenerating}
          />
          
          <ModelSelector
            selectedModelId={selectedModelId}
            onSelectModel={setSelectedModelId}
            disabled={isGenerating}
          />
          
          <ModelParameters
            selectedModelId={selectedModelId}
            parameters={parameters}
            onParameterChange={handleParameterChange}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
