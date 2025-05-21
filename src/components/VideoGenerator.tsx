
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { VIDEO_MODELS, DEFAULT_MODEL_ID, SAMPLE_PROMPTS } from '@/lib/constants';
import { createVideoPrediction } from '@/services/videoApi';
import { toast } from 'sonner';
import { Video } from '@/lib/types';
import { SettingsButton } from './SettingsButton';

interface VideoGeneratorProps {
  onVideoCreated: (video: Video) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onVideoCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const selectedModel = VIDEO_MODELS.find(model => model.id === selectedModelId);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setIsGenerating(true);
      const modelVersion = selectedModel?.version || VIDEO_MODELS[0].version;
      
      const newVideo = await createVideoPrediction(prompt, selectedModelId, modelVersion);
      onVideoCreated(newVideo);
      
      toast.success("Video generation started");
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Failed to start video generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSamplePrompt = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    setPrompt(SAMPLE_PROMPTS[randomIndex]);
  };

  return (
    <Card className="glass-card animate-fade-in">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Video</h2>
          <SettingsButton />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">
              Prompt
            </label>
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleSelectSamplePrompt} 
              className="text-xs p-0 h-auto"
            >
              Use sample prompt
            </Button>
          </div>
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to generate..."
            className="min-h-[120px]"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Model
          </label>
          <Select 
            value={selectedModelId} 
            onValueChange={setSelectedModelId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModel && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedModel.description}
            </p>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoGenerator;
