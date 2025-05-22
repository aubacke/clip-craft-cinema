
import React from 'react';
import { 
  Slider, 
  SliderTrack, 
  SliderThumb, 
  SliderRange,
} from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Radio, RadioGroup, RadioIndicator, RadioItem } from '@/components/ui/radio-group';
import { X, Upload, AlertCircle } from 'lucide-react';
import { ParameterDefinition } from './types';

interface ParameterInputProps {
  parameter: ParameterDefinition;
  value: any;
  onChange: (value: any) => void;
  imagePreviewUrl?: string | null;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  error?: string; // Add error prop
  disabled?: boolean; // Add disabled prop
}

export const ParameterInput = ({
  parameter,
  value,
  onChange,
  imagePreviewUrl,
  onImageUpload,
  onRemoveImage,
  error, // Accept error prop
  disabled = false // Default to false
}: ParameterInputProps) => {
  // Get the current value or use the default if not set
  const currentValue = value === undefined ? parameter.default : value;
  
  const renderParameterInput = () => {
    switch (parameter.type) {
      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={parameter.id} className="text-sm">{parameter.label}</Label>
              <span className="text-sm font-medium">{currentValue}</span>
            </div>
            <Slider 
              id={parameter.id}
              min={parameter.min ?? 0} 
              max={parameter.max ?? 100} 
              step={parameter.step ?? 1}
              value={[currentValue]}
              onValueChange={(values) => onChange(values[0])}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
            {parameter.description && (
              <p className="text-xs text-muted-foreground">{parameter.description}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={parameter.id} className="text-sm">{parameter.label}</Label>
            <Select 
              value={currentValue.toString()} 
              onValueChange={(val) => {
                // Convert to number if needed
                const parsed = parameter.options?.find(opt => opt.value.toString() === val)?.value;
                onChange(parsed ?? val);
              }}
              disabled={disabled}
            >
              <SelectTrigger 
                id={parameter.id} 
                className={error ? 'border-destructive' : ''}
              >
                <SelectValue placeholder={parameter.placeholder || `Select ${parameter.label}`} />
              </SelectTrigger>
              <SelectContent>
                {parameter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {parameter.description && (
              <p className="text-xs text-muted-foreground">{parameter.description}</p>
            )}
          </div>
        );
      
      case 'input':
        return (
          <div className="space-y-2">
            <Label htmlFor={parameter.id} className="text-sm">{parameter.label}</Label>
            <Input 
              id={parameter.id} 
              value={currentValue || ''} 
              type={parameter.inputType || 'text'}
              onChange={(e) => onChange(parameter.inputType === 'number' 
                ? parseFloat(e.target.value) 
                : e.target.value)}
              placeholder={parameter.placeholder || ''}
              min={parameter.min}
              max={parameter.max}
              step={parameter.step}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
            {parameter.description && (
              <p className="text-xs text-muted-foreground">{parameter.description}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={parameter.id} className="text-sm">{parameter.label}</Label>
            <Textarea 
              id={parameter.id} 
              value={currentValue || ''} 
              onChange={(e) => onChange(e.target.value)}
              placeholder={parameter.placeholder || ''}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
            {parameter.description && (
              <p className="text-xs text-muted-foreground">{parameter.description}</p>
            )}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor={parameter.id} className="text-sm">{parameter.label}</Label>
              {parameter.description && (
                <p className="text-xs text-muted-foreground">{parameter.description}</p>
              )}
            </div>
            <Switch 
              id={parameter.id} 
              checked={!!currentValue} 
              onCheckedChange={onChange}
              disabled={disabled}
              className={error ? 'border-destructive' : ''}
            />
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            <Label className="text-sm">{parameter.label}</Label>
            <RadioGroup 
              value={currentValue?.toString()} 
              onValueChange={(val) => onChange(val)}
              disabled={disabled}
            >
              <div className="flex gap-4">
                {parameter.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioItem 
                      id={`${parameter.id}-${option.value}`} 
                      value={option.value.toString()} 
                      className={error ? 'border-destructive' : ''}
                    />
                    <Label htmlFor={`${parameter.id}-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {parameter.description && (
              <p className="text-xs text-muted-foreground">{parameter.description}</p>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div className="space-y-2">
            <Label htmlFor={parameter.id} className="text-sm">{parameter.label}</Label>
            {!imagePreviewUrl ? (
              <div className="flex flex-col">
                <Label 
                  htmlFor={`file-${parameter.id}`}
                  className={`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md p-6 hover:bg-accent/50 cursor-pointer transition-colors ${error ? 'border-destructive' : ''}`}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">Upload reference image</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or WEBP (max 5MB)
                  </span>
                </Label>
                <Input 
                  id={`file-${parameter.id}`}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={onImageUpload}
                  className="hidden"
                  disabled={disabled}
                />
              </div>
            ) : (
              <div className="relative rounded-md overflow-hidden border border-border">
                <img 
                  src={imagePreviewUrl} 
                  alt="Reference"
                  className="w-full h-auto object-cover max-h-48" 
                />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={onRemoveImage}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            {parameter.description && (
              <p className="text-xs text-muted-foreground">{parameter.description}</p>
            )}
          </div>
        );
        
      default:
        return <div>Unsupported parameter type: {parameter.type}</div>;
    }
  };

  return (
    <div>
      {renderParameterInput()}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
