
import { ModelParameterDefinition } from '@/lib/replicateTypes';
import { googleVeoParameters } from './models/googleVeo';
import { kwaivgiKlingParameters } from './models/kwaivgiKling';
import { kwaivgiKlingProParameters } from './models/kwaivgiKlingPro';
import { lumaRayParameters } from './models/lumaRay';
import { lumaRayFlashParameters } from './models/lumaRayFlash';
import { getCommonParameters } from './commonParameters';
import { ParameterDefinition } from './types';

// Define parameter definitions for each supported model
export const MODEL_PARAMETERS: Record<string, ModelParameterDefinition[]> = {
  'google/veo-2': googleVeoParameters,
  'kwaivgi/kling-v2.0': kwaivgiKlingParameters,
  'kwaivgi/kling-v1.6-pro': kwaivgiKlingProParameters,
  'luma/ray-2-720p': lumaRayParameters,
  'luma/ray-flash-2-720p': lumaRayFlashParameters
};

/**
 * Gets all parameters for a specific model ID, combining common and model-specific parameters
 * @param modelId The ID of the model to get parameters for
 * @returns Array of parameter definitions for the model
 */
export const getModelParameters = (modelId: string): ParameterDefinition[] => {
  // Get common parameters that apply to all models
  const commonParams = getCommonParameters();

  // Get model-specific parameters
  const modelSpecificParams = MODEL_PARAMETERS[modelId] || [];

  // Map the model parameters from ModelParameterDefinition to ParameterDefinition
  const mappedModelParams = modelSpecificParams.map((param): ParameterDefinition => {
    // Map model parameter type to component parameter type
    let paramType: ParameterDefinition['type'];
    
    switch(param.type) {
      case 'number':
      case 'integer':
        paramType = 'number';
        break;
      case 'boolean':
        paramType = 'checkbox';
        break;
      case 'string':
        // If it has options/enum, make it a select
        paramType = param.options || (param as any).enum ? 'select' : 'text';
        break;
      case 'image':
        paramType = 'image';
        break;
      case 'aspect-ratio':
        paramType = 'radio'; // Map aspect-ratio to radio
        break;
      case 'slider':
        paramType = 'slider';
        break;
      default:
        paramType = 'text'; // Default fallback
    }

    // Handle options/enum
    const options = param.options || ((param as any).enum ? 
      (param as any).enum.map((value: any) => ({
        value,
        label: String(value).charAt(0).toUpperCase() + String(value).slice(1)
      })) : undefined);

    return {
      id: param.name,
      label: param.label,
      type: paramType,
      options,
      min: param.min !== undefined ? param.min : undefined,
      max: param.max !== undefined ? param.max : undefined,
      step: param.step !== undefined ? param.step : undefined,
      defaultValue: param.defaultValue,
      description: param.description,
      path: param.name.includes('.') ? param.name : undefined,
      isAdvanced: param.isAdvanced,
    };
  });

  // Return combined parameters
  return [...commonParams, ...mappedModelParams];
};

export { getCommonParameters };
