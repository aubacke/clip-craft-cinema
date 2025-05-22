
import { ModelParameterDefinition } from '@/lib/replicateTypes';
import { googleVeoParameters } from './models/googleVeo';
import { kwaivgiKlingParameters } from './models/kwaivgiKling';
import { kwaivgiKlingProParameters } from './models/kwaivgiKlingPro';
import { lumaRayParameters } from './models/lumaRay';
import { lumaRayFlashParameters } from './models/lumaRayFlash';
import { getCommonParameters } from './commonParameters';

// Define parameter definitions for each supported model
export const MODEL_PARAMETERS: Record<string, ModelParameterDefinition[]> = {
  'google/veo-2': googleVeoParameters,
  'kwaivgi/kling-v2.0': kwaivgiKlingParameters,
  'kwaivgi/kling-v1.6-pro': kwaivgiKlingProParameters,
  'luma/ray-2-720p': lumaRayParameters,
  'luma/ray-flash-2-720p': lumaRayFlashParameters
};

export { getCommonParameters };
