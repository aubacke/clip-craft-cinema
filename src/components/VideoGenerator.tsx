
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { SAMPLE_PROMPTS, DEFAULT_MODEL_ID } from '@/lib/constants';
import { createVideoPrediction } from '@/services/videoApi';
import { toast } from 'sonner';
import { Video } from '@/lib/types';
import { SettingsButton } from './SettingsButton';
import { fetchReplicateModels, fetchModelDetails } from '@/services/replicateService';
import { ReplicateModel } from '@/lib/replicateTypes';
import { Loader2 } from 'lucide-react';

interface VideoGeneratorProps {
  onVideoCreated: (video: Video) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onVideoCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState<ReplicateModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelVersions, setModelVersions] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get the selected model
  const selectedModel = models.find(model => `${model.owner}/${model.name}` === selectedModelId);
  
  // Fetch available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        setErrorMessage(null);
        const data = await fetchReplicateModels({ filter: "video" });
        
        // Format models into our required format
        const formattedModels = data.results.map(model => {
          // Store default version ID in our state
          if (model.latest_version) {
            setModelVersions(prev => ({
              ...prev,
              [`${model.owner}/${model.name}`]: model.latest_version.id
            }));
          }
          
          return model;
        });
        
        setModels(formattedModels);
      } catch (error) {
        console.error("Error fetching models:", error);
        setErrorMessage("Failed to load models. Please check your API key in settings.");
        toast.error("Failed to load models. Please check your API key.");
      } finally {
        setIsLoadingModels(false);
      }
    };
    
    loadModels();
  }, []);
  
  // Fetch details for a specific model when selected
  useEffect(() => {
    if (selectedModelId && !modelVersions[selectedModelId]) {
      const fetchVersions = async () => {
        try {
          const modelDetails = await fetchModelDetails(selectedModelId);
          if (modelDetails.versions && modelDetails.versions.length > 0) {
            setModelVersions(prev => ({
              ...prev,
              [selectedModelId]: modelDetails.versions[0].id
            }));
          }
        } catch (error) {
          console.error(`Error fetching versions for ${selectedModelId}:`, error);
        }
      };
      
      fetchVersions();
    }
  }, [selectedModelId]);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!selectedModelId || !modelVersions[selectedModelId]) {
      toast.error("Invalid model selection");
      return;
    }

    try {
      setIsGenerating(true);
      const modelVersion = modelVersions[selectedModelId];
      
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
          
          {isLoadingModels ? (
            <div className="flex items-center space-x-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading models...</span>
            </div>
          ) : errorMessage ? (
            <div className="text-sm text-red-500">
              {errorMessage}
            </div>
          ) : (
            <Select 
              value={selectedModelId} 
              onValueChange={setSelectedModelId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem 
                    key={`${model.owner}/${model.name}`} 
                    value={`${model.owner}/${model.name}`}
                  >
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {selectedModel && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedModel.description}
            </p>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || isLoadingModels || !selectedModel}
        >
          {isGenerating ? "Generating..." : "Generate Video"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default VideoGenerator;
