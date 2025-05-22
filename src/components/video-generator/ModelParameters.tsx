
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { ParameterSection } from './parameters/ParameterSection';
import { VideoGenerationParameters } from '@/lib/types';
import { getModelParameters } from './parameters/modelDefinitions';
import { useImageUpload } from './hooks/useImageUpload';
import { ValidationMessage } from './shared/ValidationMessage';

export interface ModelParametersProps {
  selectedModelId: string;
  parameters: VideoGenerationParameters;
  onParameterChange: (params: VideoGenerationParameters) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const ModelParameters = React.memo<ModelParametersProps>(({
  selectedModelId,
  parameters,
  onParameterChange,
  errors = {},
  disabled = false
}) => {
  const modelParams = React.useMemo(() => getModelParameters(selectedModelId), [selectedModelId]);

  const handleParameterChange = useCallback((name: string, value: any) => {
    onParameterChange({
      ...parameters,
      [name]: value,
    });
  }, [onParameterChange, parameters]);

  // Use the custom image upload hook
  const { 
    imagePreviewUrl, 
    dragActive, 
    error: imageError, 
    handleImageUpload, 
    handleRemoveImage,
    handleDrag,
    handleDrop
  } = useImageUpload({
    onChange: (file) => {
      onParameterChange({
        ...parameters,
        image: file,
      });
    }
  });

  // Combine custom validation errors with provided errors
  const combinedErrors = {
    ...errors,
    ...(imageError ? { image: imageError } : {})
  };

  return (
    <Card 
      className={`p-4 ${dragActive ? 'border-primary border-2' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <ParameterSection
        parameters={modelParams}
        values={parameters}
        onParameterChange={handleParameterChange}
        imagePreviewUrl={imagePreviewUrl}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        errors={combinedErrors}
        disabled={disabled}
        dragActive={dragActive}
      />
    </Card>
  );
});

ModelParameters.displayName = 'ModelParameters';
