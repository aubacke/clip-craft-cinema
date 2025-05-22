
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
  const mappedModelParams = modelSpecificParams.map((param): ParameterDefinition => ({
    id: param.name,
    label: param.label,
    type: param.type === 'number' || param.type === 'integer' ? 'number' :
          param.type === 'boolean' ? 'checkbox' :
          param.type === 'string' && param.enum ? 'select' :
          param.type === 'image' ? 'image' :
          param.type,
    options: param.options || (param.enum ? param.enum.map(value => ({
      value,
      label: String(value).charAt(0).toUpperCase() + String(value).slice(1)
    })) : undefined),
    min: param.min !== undefined ? param.min : undefined,
    max: param.max !== undefined ? param.max : undefined,
    step: param.step !== undefined ? param.step : undefined,
    defaultValue: param.defaultValue,
    description: param.description,
    path: param.name.includes('.') ? param.name : undefined,
    isAdvanced: param.isAdvanced,
  }));

  // Return combined parameters
  return [...commonParams, ...mappedModelParams];
};

export { getCommonParameters };
