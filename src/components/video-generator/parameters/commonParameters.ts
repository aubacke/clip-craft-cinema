
import { ModelParameterDefinition } from '@/lib/replicateTypes';

// Return common parameters that apply to all models
export const getCommonParameters = (): ModelParameterDefinition[] => {
  return []; // Empty array - prompt is already handled by PromptInput component
};
