
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import { FormControl, FormDescription, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { ParameterDefinition } from './types';
import { ValidationMessage } from '../shared/ValidationMessage';

interface ParameterInputProps {
  parameter: ParameterDefinition;
  value: any;
  onChange: (value: any) => void;
  imagePreviewUrl?: string;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  error?: string;
  disabled?: boolean;
  dragActive?: boolean;
}

export const ParameterInput = React.memo<ParameterInputProps>(({
  parameter,
  value,
  onChange,
  imagePreviewUrl,
  onImageUpload,
  onRemoveImage,
  error,
  disabled = false,
  dragActive = false
}) => {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const hasError = !!error;

  return (
    <FormItem className={cn(
      'space-y-1', 
      parameter.isAdvanced ? 'opacity-90' : '',
      hasError ? 'pb-4' : ''
    )}>
      <div className="flex justify-between">
        <FormLabel className={cn(
          "text-sm",
          hasError && "text-destructive"
        )}>
          {parameter.label}
          {parameter.isAdvanced && <span className="ml-1 text-xs text-muted-foreground">(Advanced)</span>}
        </FormLabel>
      </div>
      <FormControl>
        {parameter.type === 'text' && (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`Enter ${parameter.label.toLowerCase()}`}
            className={cn(
              "min-h-24",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={hasError}
          />
        )}
        {parameter.type === 'number' && (
          <Input
            type="number"
            value={value !== undefined ? value : ''}
            onChange={(e) => onChange(Number(e.target.value))}
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            disabled={disabled}
            className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={hasError}
          />
        )}
        {parameter.type === 'slider' && (
          <div className="pt-3 pb-2 pl-0.5">
            <Slider
              defaultValue={[value !== undefined ? value : (parameter.defaultValue || 0)]}
              value={[value !== undefined ? value : (parameter.defaultValue || 0)]}
              min={parameter.min}
              max={parameter.max}
              step={parameter.step}
              onValueChange={handleSliderChange}
              disabled={disabled}
              aria-label={parameter.label}
              className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={hasError}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{parameter.min}</span>
              <span className="text-xs font-medium">{value}</span>
              <span className="text-xs text-muted-foreground">{parameter.max}</span>
            </div>
          </div>
        )}
        {parameter.type === 'select' && parameter.options && (
          <Select
            value={String(value !== undefined ? value : parameter.defaultValue || '')}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={cn(hasError && "border-destructive focus-visible:ring-destructive")}>
              <SelectValue placeholder={`Select ${parameter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {parameter.options.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {parameter.type === 'checkbox' && (
          <Switch
            checked={!!value}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        )}
        {parameter.type === 'radio' && parameter.options && (
          <RadioGroup
            value={String(value !== undefined ? value : parameter.defaultValue || '')}
            onValueChange={onChange}
            disabled={disabled}
            className="flex flex-col space-y-1"
          >
            {parameter.options.map((option) => (
              <div key={String(option.value)} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={String(option.value)} 
                  id={`${parameter.id}-${option.value}`}
                  className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
                />
                <Label htmlFor={`${parameter.id}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        {parameter.type === 'image' && (
          <div>
            {imagePreviewUrl ? (
              <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden">
                <img
                  src={imagePreviewUrl}
                  className="w-full h-full object-cover"
                  alt="Reference image"
                />
                {onRemoveImage && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={onRemoveImage}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image-upload"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/30 transition-colors",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-secondary/20",
                    dragActive && "border-primary bg-primary/5",
                    hasError && "border-destructive"
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={cn(
                      "w-8 h-8 mb-2",
                      hasError ? "text-destructive" : "text-muted-foreground"
                    )} />
                    <p className={cn(
                      "mb-2 text-sm",
                      hasError ? "text-destructive" : "text-muted-foreground"
                    )}>
                      <span className="font-semibold">
                        {dragActive ? "Drop image here" : "Click to upload"}
                      </span>
                      {!dragActive && " or drag and drop"}
                    </p>
                    <p className={cn(
                      "text-xs",
                      hasError ? "text-destructive" : "text-muted-foreground"
                    )}>
                      PNG, JPG or WEBP (max. 5MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={onImageUpload}
                    disabled={disabled}
                  />
                </label>
              </div>
            )}
            {error && <ValidationMessage message={error} className="mt-2" />}
          </div>
        )}
      </FormControl>
      {parameter.description && (
        <FormDescription className="text-xs text-muted-foreground">
          {parameter.description}
        </FormDescription>
      )}
    </FormItem>
  );
});

ParameterInput.displayName = 'ParameterInput';
