
import React from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ModelParameterDefinition } from '@/lib/replicateTypes';

interface ParameterInputProps {
  param: ModelParameterDefinition;
  value: any;
  onChange: (name: string, value: any) => void;
  imagePreviewUrl: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  param,
  value,
  onChange,
  imagePreviewUrl,
  onImageUpload,
  onRemoveImage
}) => {
  switch (param.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value as string || ''}
          onChange={(e) => onChange(param.name, e.target.value)}
          placeholder={param.description}
        />
      );
      
    case 'number':
      return (
        <Input
          type="number"
          value={value as number || ''}
          onChange={(e) => onChange(param.name, e.target.value ? Number(e.target.value) : undefined)}
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
            onValueChange={(vals) => onChange(param.name, vals[0])}
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
          onCheckedChange={(checked) => onChange(param.name, checked)}
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
            onChange(param.name, finalVal);
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
              onChange={onImageUpload}
              className="hidden"
            />
            {imagePreviewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemoveImage}
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
