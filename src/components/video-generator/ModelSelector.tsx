
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ReplicateModel } from '@/lib/replicateTypes';
import { VIDEO_MODELS } from '@/lib/constants';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  models?: any[];
  selectedModel?: any | undefined;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onModelSelect,
  disabled = false,
  isLoading = false,
  errorMessage = null,
  models = VIDEO_MODELS,
  selectedModel = VIDEO_MODELS.find(m => m.id === selectedModelId)
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">
        Model
      </label>
      
      {isLoading ? (
        <div className="flex items-center space-x-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading models...</span>
        </div>
      ) : errorMessage ? (
        <div className="text-sm text-red-500">
          {errorMessage}
        </div>
      ) : models.length === 0 ? (
        <div className="text-sm text-amber-500">
          No models found. Please check your API key settings.
        </div>
      ) : (
        <Select 
          value={selectedModelId} 
          onValueChange={onModelSelect}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id}
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
  );
};
