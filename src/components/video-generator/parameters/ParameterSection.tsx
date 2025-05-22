
import React from 'react';
import { ParameterInput } from './ParameterInput';
import { ParameterDefinition } from './types';
import { ValidationMessage } from '../shared/ValidationMessage';

interface ParameterSectionProps {
  parameters: ParameterDefinition[];
  values: any;
  onParameterChange: (name: string, value: any) => void;
  imagePreviewUrl?: string | null;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  dragActive?: boolean;
}

export const ParameterSection = React.memo<ParameterSectionProps>(({
  parameters,
  values,
  onParameterChange,
  imagePreviewUrl,
  onImageUpload,
  onRemoveImage,
  errors = {},
  disabled = false,
  dragActive = false
}) => {
  return (
    <div className="space-y-4">
      {parameters.map((param) => (
        <React.Fragment key={param.id}>
          <ParameterInput 
            parameter={param}
            value={param.path?.includes('.') 
              ? values[param.path.split('.')[0]]?.[param.path.split('.')[1]] 
              : values[param.id]}
            onChange={(value) => onParameterChange(param.path || param.id, value)}
            imagePreviewUrl={param.type === 'image' ? imagePreviewUrl : undefined}
            onImageUpload={param.type === 'image' ? onImageUpload : undefined}
            onRemoveImage={param.type === 'image' ? onRemoveImage : undefined}
            error={errors[param.id] || errors[param.path || '']}
            disabled={disabled}
            dragActive={param.type === 'image' ? dragActive : undefined}
          />
          {errors[param.id] && param.type !== 'image' && (
            <ValidationMessage message={errors[param.id]} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

ParameterSection.displayName = 'ParameterSection';
