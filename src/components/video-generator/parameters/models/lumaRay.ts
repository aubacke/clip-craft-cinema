
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const lumaRayParameters: ModelParameterDefinition[] = [
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
];
