import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { ParameterSection } from './parameters/ParameterSection';
import { VideoGenerationParameters } from '@/lib/types';
import { getModelParameters } from './parameters/modelDefinitions';

export interface ModelParametersProps {
  selectedModelId: string;
  parameters: VideoGenerationParameters;
  onParameterChange: (params: VideoGenerationParameters) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const ModelParameters: React.FC<ModelParametersProps> = ({
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

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // You might also want to handle storing the image file itself
      onParameterChange({
        ...parameters,
        image: file,
      });
    }
  }, [onParameterChange, parameters]);

  const handleRemoveImage = useCallback(() => {
    setImagePreviewUrl(null);
    onParameterChange({
      ...parameters,
      image: null,
    });
  }, [onParameterChange, parameters]);

  return (
    <Card className="p-4">
      <ParameterSection
        parameters={modelParams}
        values={parameters}
        onParameterChange={handleParameterChange}
        imagePreviewUrl={imagePreviewUrl}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        errors={errors}
        disabled={disabled}
      />
    </Card>
  );
};
