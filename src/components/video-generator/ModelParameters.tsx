
import React, { useState } from 'react';
import { VideoGenerationParameters } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MODEL_PARAMETERS, getCommonParameters } from './parameters/modelDefinitions';
import { ParameterSection } from './parameters/ParameterSection';
import { createFolderForReferenceImage, saveReferenceImageToLocalStorage } from '@/services/video/referenceImageService';
import { v4 as uuidv4 } from 'uuid';

interface ModelParametersProps {
  selectedModelId: string;
  parameters: VideoGenerationParameters;
  onParameterChange: (parameters: VideoGenerationParameters) => void;
  errors?: Record<string, string>; // Add errors prop
  disabled?: boolean; // Add disabled prop
}

export const ModelParameters: React.FC<ModelParametersProps> = ({
  selectedModelId,
  parameters,
  onParameterChange,
  errors = {}, // Default to empty object
  disabled = false // Default to false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  // Get parameters specific to the selected model
  const modelParameters = selectedModelId ? MODEL_PARAMETERS[selectedModelId] || [] : [];
  const commonParameters = getCommonParameters();
  
  const allParameters = [...commonParameters, ...modelParameters];
  const basicParameters = allParameters.filter(param => !param.isAdvanced);
  const advancedParameters = allParameters.filter(param => param.isAdvanced);
  
  const handleParameterChange = (name: string, value: any) => {
    if (name.includes('.')) {
      // Handle nested parameters (e.g. model_specific.style)
      const [parent, child] = name.split('.');
      
      // Fix: Ensure model_specific exists before trying to spread it
      const modelSpecific = parameters.model_specific || {};
      
      onParameterChange({
        ...parameters,
        [parent]: {
          ...modelSpecific,
          [child]: value
        }
      });
    } else {
      onParameterChange({
        ...parameters,
        [name]: value
      });
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL for the image
    const imageUrl = URL.createObjectURL(file);
    setImagePreviewUrl(imageUrl);
    
    // Create a folder for the reference image
    const folder = createFolderForReferenceImage(file);
    
    // Save the reference image to localStorage
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageId = uuidv4();
      saveReferenceImageToLocalStorage({
        id: imageId,
        name: file.name,
        dataUrl: reader.result as string,
        folderId: folder.id,
        createdAt: new Date().toISOString()
      });
      
      // Update the parameters with the image and reference information
      onParameterChange({
        ...parameters,
        image: file,
        referenceImageId: imageId,
        referenceImageFolderId: folder.id
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    onParameterChange({
      ...parameters,
      image: null,
      image_url: undefined,
      referenceImageId: undefined,
      referenceImageFolderId: undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic parameters */}
      <ParameterSection
        parameters={basicParameters}
        values={parameters}
        onParameterChange={handleParameterChange}
        imagePreviewUrl={imagePreviewUrl}
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        errors={errors}
        disabled={disabled}
      />
      
      {/* Advanced parameters */}
      {advancedParameters.length > 0 && (
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" type="button" className="w-full flex justify-between" disabled={disabled}>
              <span>Advanced Options</span>
              {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <ParameterSection
              parameters={advancedParameters}
              values={parameters}
              onParameterChange={handleParameterChange}
              imagePreviewUrl={imagePreviewUrl}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              errors={errors}
              disabled={disabled}
            />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
