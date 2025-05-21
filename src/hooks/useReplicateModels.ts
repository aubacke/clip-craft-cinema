
import { useState, useEffect } from 'react';
import { fetchReplicateModels, fetchModelDetails } from '@/services/replicateService';
import { ReplicateModel } from '@/lib/replicateTypes';
import { toast } from 'sonner';

// List of allowed models
export const ALLOWED_MODELS = [
  "google/veo-2", 
  "kwaivgi/kling-v2.0", 
  "luma/ray-2-720p", 
  "luma/ray-flash-2-720p"
];

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
        const data = await fetchReplicateModels({ 
          filter: "video",
          allowList: ALLOWED_MODELS
        });
        
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
        
        // Auto-select the first model if available
        if (formattedModels.length > 0) {
          const firstModelId = `${formattedModels[0].owner}/${formattedModels[0].name}`;
          setSelectedModelId(firstModelId);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        setErrorMessage("Failed to load models. Please check your API key in settings.");
        toast.error("Failed to load models. Please check your API key.");
      } finally {
        setIsLoading(false);
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
