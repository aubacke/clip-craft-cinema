
import React from 'react';
import { Label } from '@/components/ui/label';
import { ModelParameterDefinition } from '@/lib/replicateTypes';
import { ParameterInput } from './ParameterInput';

interface ParameterSectionProps {
  parameters: ModelParameterDefinition[];
  values: Record<string, any>;
  onParameterChange: (name: string, value: any) => void;
  imagePreviewUrl: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const ParameterSection: React.FC<ParameterSectionProps> = ({
  parameters,
  values,
  onParameterChange,
  imagePreviewUrl,
  onImageUpload,
  onRemoveImage
}) => {
  const getValue = (name: string) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      return values[parent]?.[child];
    }
    return values[name];
  };

  return (
    <div className="space-y-3">
      {parameters.map((param) => (
        <div key={param.name} className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor={param.name}>{param.label}</Label>
            {param.description && (
              <span className="text-xs text-muted-foreground">{param.description}</span>
            )}
          </div>
          <ParameterInput
            param={param}
            value={getValue(param.name)}
            onChange={onParameterChange}
            imagePreviewUrl={param.type === 'image' ? imagePreviewUrl : null}
            onImageUpload={onImageUpload}
            onRemoveImage={onRemoveImage}
          />
        </div>
      ))}
    </div>
  );
};
