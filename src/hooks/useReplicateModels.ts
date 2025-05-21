
import { useState, useEffect } from 'react';
import { fetchReplicateModels, fetchModelDetails } from '@/services/replicateService';
import { ReplicateModel } from '@/lib/replicateTypes';
import { toast } from 'sonner';
import { VIDEO_MODELS } from '@/lib/constants';

// List of allowed models from our constants
export const ALLOWED_MODELS = VIDEO_MODELS.map(model => model.id);

export function useReplicateModels() {
  const [models, setModels] = useState<ReplicateModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modelVersions, setModelVersions] = useState<Record<string, string>>({});
  const [selectedModelId, setSelectedModelId] = useState('');
  
  // Get the selected model
  const selectedModel = models.find(model => `${model.owner}/${model.name}` === selectedModelId);

  // Fetch available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Use our constants directly instead of fetching
        const staticModels = VIDEO_MODELS.map(model => {
          const [owner, name] = model.id.split('/');
          
          // Create a complete ReplicateModel object with all required properties
          const replicateModel: ReplicateModel = {
            url: `https://replicate.com/${owner}/${name}`,
            owner,
            name,
            description: model.description,
            visibility: 'public',
            github_url: '',
            paper_url: '',
            license_url: '',
            run_count: 0,
            cover_image_url: '',
            latest_version: {
              id: model.version,
              created_at: new Date().toISOString(),
              cog_version: '0.0.0',
              openapi_schema: {}
            }
          };
          
          return replicateModel;
        });
        
        // Set the models
        setModels(staticModels);
        
        // Set up versions for each model
        const versionMap: Record<string, string> = {};
        staticModels.forEach(model => {
          const modelId = `${model.owner}/${model.name}`;
          const videoModel = VIDEO_MODELS.find(vm => vm.id === modelId);
          if (videoModel) {
            versionMap[modelId] = videoModel.version;
          }
        });
        
        setModelVersions(versionMap);
        
        // Auto-select the first model if available
        if (staticModels.length > 0) {
          const firstModelId = `${staticModels[0].owner}/${staticModels[0].name}`;
          setSelectedModelId(firstModelId);
        }
      } catch (error) {
        console.error("Error setting up models:", error);
        setErrorMessage("Failed to initialize models.");
        toast.error("Failed to initialize models.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadModels();
  }, []);

  return {
    models,
    isLoading,
    errorMessage,
    modelVersions,
    selectedModelId,
    selectedModel,
    setSelectedModelId
  };
}
