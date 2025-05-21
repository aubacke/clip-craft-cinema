
import { ModelParameterDefinition } from '@/lib/replicateTypes';

// Return common parameters that apply to all models
export const getCommonParameters = (): ModelParameterDefinition[] => {
  return [
    {
      name: 'prompt',
      type: 'text',
      label: 'Prompt',
      description: 'Description of the video you want to generate'
    }
  ];
};
