import React, { useState } from 'react';
import { ModelParameterDefinition, VideoGenerationParameters } from '@/lib/replicateTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';

interface ModelParametersProps {
  selectedModelId: string;
  parameters: VideoGenerationParameters;
  onParameterChange: (parameters: VideoGenerationParameters) => void;
}

// Define parameter definitions for each supported model
const MODEL_PARAMETERS: Record<string, ModelParameterDefinition[]> = {
  'google/veo-2': [
    {
      name: 'negative_prompt',
      type: 'text',
      label: 'Negative Prompt',
      description: 'What should not be in the video',
      isAdvanced: true
    },
    {
      name: 'aspect_ratio',
      type: 'select',
      label: 'Aspect Ratio',
      defaultValue: '1:1',
      options: [
        { value: '1:1', label: '1:1 (Square)' },
        { value: '16:9', label: '16:9 (Landscape)' },
        { value: '9:16', label: '9:16 (Portrait)' }
      ],
      description: 'The aspect ratio of the video'
    },
    {
      name: 'cfg_scale',
      type: 'slider',
      label: 'CFG Scale',
      defaultValue: 7,
      min: 1,
      max: 15,
      step: 0.5,
      description: 'How closely the model should follow the prompt',
      isAdvanced: true
    },
    {
      name: 'seed',
      type: 'number',
      label: 'Seed',
      description: 'Random seed for reproducibility. Leave blank for random',
      isAdvanced: true
    },
    {
      name: 'steps',
      type: 'slider',
      label: 'Steps',
      defaultValue: 30,
      min: 10,
      max: 50,
      step: 1,
      description: 'Number of denoising steps',
      isAdvanced: true
    },
    {
      name: 'image',
      type: 'image',
      label: 'Reference Image',
      description: 'Optional image to guide the video generation',
      isAdvanced: false
    }
  ],
  'kwaivgi/kling-v2.0': [
    {
      name: 'negative_prompt',
      type: 'text',
      label: 'Negative Prompt',
      description: 'What should not be in the video',
      isAdvanced: true
    },
    {
      name: 'width',
      type: 'select',
      label: 'Width',
      defaultValue: 512,
      options: [
        { value: 512, label: '512px' },
        { value: 768, label: '768px' },
        { value: 1024, label: '1024px' }
      ],
      description: 'Width of the video'
    },
    {
      name: 'height',
      type: 'select',
      label: 'Height',
      defaultValue: 512,
      options: [
        { value: 512, label: '512px' },
        { value: 768, label: '768px' },
        { value: 1024, label: '1024px' }
      ],
      description: 'Height of the video'
    },
    {
      name: 'cfg_scale',
      type: 'slider',
      label: 'CFG Scale',
      defaultValue: 8,
      min: 1,
      max: 15,
      step: 0.5,
      description: 'How closely the model should follow the prompt',
      isAdvanced: true
    },
    {
      name: 'num_frames',
      type: 'slider',
      label: 'Number of Frames',
      defaultValue: 24,
      min: 12,
      max: 48,
      step: 4,
      description: 'Number of frames in the video',
      isAdvanced: true
    },
    {
      name: 'fps',
      type: 'select',
      label: 'FPS',
      defaultValue: 8,
      options: [
        { value: 8, label: '8 FPS' },
        { value: 12, label: '12 FPS' },
        { value: 24, label: '24 FPS' }
      ],
      description: 'Frames per second',
      isAdvanced: true
    },
    {
      name: 'seed',
      type: 'number',
      label: 'Seed',
      description: 'Random seed for reproducibility. Leave blank for random',
      isAdvanced: true
    },
    {
      name: 'model_specific.motion_strength',
      type: 'slider',
      label: 'Motion Strength',
      defaultValue: 0.5,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      description: 'Strength of the motion in the video',
      isAdvanced: true
    }
  ],
  'luma/ray-2-720p': [
    {
      name: 'negative_prompt',
      type: 'text',
      label: 'Negative Prompt',
      description: 'What should not be in the video',
      isAdvanced: true
    },
    {
      name: 'model_specific.style',
      type: 'select',
      label: 'Style',
      defaultValue: 'cinematic',
      options: [
        { value: 'cinematic', label: 'Cinematic' },
        { value: 'vibrant', label: 'Vibrant' },
        { value: 'detailed', label: 'Detailed' }
      ],
      description: 'Style of the video'
    },
    {
      name: 'fps',
      type: 'select',
      label: 'FPS',
      defaultValue: 24,
      options: [
        { value: 24, label: '24 FPS' },
        { value: 30, label: '30 FPS' }
      ],
      description: 'Frames per second',
      isAdvanced: true
    },
    {
      name: 'num_frames',
      type: 'slider',
      label: 'Number of Frames',
      defaultValue: 48,
      min: 24,
      max: 96,
      step: 8,
      description: 'Number of frames in the video',
      isAdvanced: true
    },
    {
      name: 'seed',
      type: 'number',
      label: 'Seed',
      description: 'Random seed for reproducibility. Leave blank for random',
      isAdvanced: true
    }
  ],
  'luma/ray-flash-2-720p': [
    {
      name: 'negative_prompt',
      type: 'text',
      label: 'Negative Prompt',
      description: 'What should not be in the video',
      isAdvanced: true
    },
    {
      name: 'model_specific.style',
      type: 'select',
      label: 'Style',
      defaultValue: 'abstract',
      options: [
        { value: 'abstract', label: 'Abstract' },
        { value: 'dynamic', label: 'Dynamic' },
        { value: 'colorful', label: 'Colorful' }
      ],
      description: 'Style of the video'
    },
    {
      name: 'fps',
      type: 'select',
      label: 'FPS',
      defaultValue: 30,
      options: [
        { value: 24, label: '24 FPS' },
        { value: 30, label: '30 FPS' }
      ],
      description: 'Frames per second',
      isAdvanced: true
    },
    {
      name: 'num_frames',
      type: 'slider',
      label: 'Number of Frames',
      defaultValue: 30,
      min: 15,
      max: 60,
      step: 5,
      description: 'Number of frames in the video',
      isAdvanced: true
    },
    {
      name: 'seed',
      type: 'number',
      label: 'Seed',
      description: 'Random seed for reproducibility. Leave blank for random',
      isAdvanced: true
    }
  ]
};

// Return common parameters that apply to all models
const getCommonParameters = (): ModelParameterDefinition[] => {
  return [
    {
      name: 'prompt',
      type: 'text',
      label: 'Prompt',
      description: 'Description of the video you want to generate'
    }
  ];
};

export const ModelParameters: React.FC<ModelParametersProps> = ({
  selectedModelId,
  parameters,
  onParameterChange
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
    
    onParameterChange({
      ...parameters,
      image: file
    });
  };
  
  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    onParameterChange({
      ...parameters,
      image: null,
      image_url: undefined
    });
  };
  
  const renderParameterInput = (param: ModelParameterDefinition) => {
    const getValue = (name: string) => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return parameters[parent as keyof VideoGenerationParameters]?.[child];
      }
      return parameters[param.name as keyof VideoGenerationParameters];
    };
    
    const value = getValue(param.name);
    
    switch (param.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value as string || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.description}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={param.description}
            min={param.min}
            max={param.max}
            step={param.step}
          />
        );
        
      case 'slider':
        return (
          <div className="flex flex-col space-y-2">
            <Slider
              value={[value as number || param.defaultValue]}
              min={param.min}
              max={param.max}
              step={param.step}
              onValueChange={(vals) => handleParameterChange(param.name, vals[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{param.min}</span>
              <span>{value || param.defaultValue}</span>
              <span>{param.max}</span>
            </div>
          </div>
        );
        
      case 'checkbox':
        return (
          <Checkbox
            checked={value as boolean || false}
            onCheckedChange={(checked) => handleParameterChange(param.name, checked)}
          />
        );
        
      case 'select':
        return (
          <Select
            value={String(value || param.defaultValue)}
            onValueChange={(val) => {
              // Convert to number if it's a numeric value
              const numVal = parseFloat(val);
              const finalVal = isNaN(numVal) ? val : numVal;
              handleParameterChange(param.name, finalVal);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={param.label} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md">
                  <Upload size={16} />
                  Choose Image
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreviewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  <X size={16} className="mr-1" /> Remove
                </Button>
              )}
            </div>
            
            {imagePreviewUrl && (
              <div className="relative w-full max-w-[200px] border rounded-md overflow-hidden">
                <AspectRatio ratio={1}>
                  <img 
                    src={imagePreviewUrl} 
                    alt="Reference image" 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Basic parameters */}
      <div className="space-y-3">
        {basicParameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={param.name}>{param.label}</Label>
              {param.description && (
                <span className="text-xs text-muted-foreground">{param.description}</span>
              )}
            </div>
            {renderParameterInput(param)}
          </div>
        ))}
      </div>
      
      {/* Advanced parameters */}
      {advancedParameters.length > 0 && (
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" type="button" className="w-full flex justify-between">
              <span>Advanced Options</span>
              {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-3">
            {advancedParameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor={param.name}>{param.label}</Label>
                  {param.description && (
                    <span className="text-xs text-muted-foreground">{param.description}</span>
                  )}
                </div>
                {renderParameterInput(param)}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
