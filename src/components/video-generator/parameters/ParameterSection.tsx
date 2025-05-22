
import React from 'react';
import { ParameterInput } from './ParameterInput';
import { ParameterDefinition } from './types';

interface ParameterSectionProps {
  parameters: ParameterDefinition[];
  values: any;
  onParameterChange: (name: string, value: any) => void;
  imagePreviewUrl?: string | null;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  errors?: Record<string, string>; // Add errors prop
  disabled?: boolean; // Add disabled prop
}

export const ParameterSection: React.FC<ParameterSectionProps> = ({
  parameters,
  values,
  onParameterChange,
  imagePreviewUrl,
  onImageUpload,
  onRemoveImage,
  errors = {}, // Default to empty object
  disabled = false // Default to false
}) => {
  return (
    <div className="space-y-4">
      {parameters.map((param) => (
        <ParameterInput 
          key={param.id}
          parameter={param}
          value={param.path?.includes('.') 
            ? values[param.path.split('.')[0]]?.[param.path.split('.')[1]] 
            : values[param.id]}
          onChange={(value) => onParameterChange(param.path || param.id, value)}
          imagePreviewUrl={param.type === 'image' ? imagePreviewUrl : undefined}
          onImageUpload={param.type === 'image' ? onImageUpload : undefined}
          onRemoveImage={param.type === 'image' ? onRemoveImage : undefined}
          error={errors[param.id] || errors[param.path || '']} // Pass error if exists
          disabled={disabled}
        />
      ))}
    </div>
  );
};
