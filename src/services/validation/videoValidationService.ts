
import { VIDEO_MODELS } from '@/lib/constants';
import { ValidationRule, ValidationSchema } from '@/lib/errorHandling';

// Prompt validation schema
export const promptValidationRules: ValidationRule[] = [
  {
    validate: (value) => !!value && typeof value === 'string',
    message: 'Please enter a description for your video'
  },
  {
    validate: (value) => typeof value === 'string' && value.trim().length > 0,
    message: 'Description cannot be empty'
  },
  {
    validate: (value) => typeof value === 'string' && value.length <= 1000,
    message: 'Description is too long (max 1000 characters)'
  }
];

// Model validation schema
export const modelValidationRules: ValidationRule[] = [
  {
    validate: (value) => !!value && typeof value === 'string',
    message: 'Please select a video model'
  },
  {
    validate: (value) => VIDEO_MODELS.some(model => model.id === value),
    message: 'Selected model is not available'
  }
];

// Create a validation schema for video generation parameters
export const createVideoValidationSchema = (parameters: any): ValidationSchema => {
  const schema: ValidationSchema = {
    prompt: promptValidationRules,
    selectedModelId: modelValidationRules,
  };
  
  // Add parameter-specific validation rules if needed
  if (parameters.cfg_scale !== undefined) {
    schema.cfg_scale = [
      {
        validate: (value) => value >= 1 && value <= 30,
        message: 'CFG Scale must be between 1 and 30'
      }
    ];
  }
  
  if (parameters.fps !== undefined) {
    schema.fps = [
      {
        validate: (value) => value >= 1 && value <= 60,
        message: 'FPS must be between 1 and 60'
      }
    ];
  }
  
  return schema;
};
