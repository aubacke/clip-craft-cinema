import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { VIDEO_MODELS } from '@/lib/constants';
import { FormMessage } from '@/components/ui/form';

export interface ModelSelectorProps {
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
  error?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onModelSelect,
  disabled = false,
  error,
}) => {
  
  return (
    <div className="space-y-2">
      {error && (
        <FormMessage className="text-sm" aria-live="polite">
          {error}
        </FormMessage>
      )}
      <RadioGroup
        value={selectedModelId}
        onValueChange={onModelSelect}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        disabled={disabled}
      >
        {VIDEO_MODELS.map((model) => (
          <Card key={model.id} className="p-4 cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="space-y-1">
              <RadioGroupItem value={model.id} id={model.id} className="sr-only" />
              <Label htmlFor={model.id} className="font-semibold text-sm">{model.name}</Label>
              <p className="text-xs text-muted-foreground">{model.description}</p>
            </div>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
};
