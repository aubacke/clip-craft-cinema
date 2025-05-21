
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const lumaRayFlashParameters: ModelParameterDefinition[] = [
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
    defaultValue: 'abstract',
    options: [
      { value: 'abstract', label: 'Abstract' },
      { value: 'dynamic', label: 'Dynamic' },
      { value: 'colorful', label: 'Colorful' }
    ],
    description: 'Style of the video'
  },
  {
    name: 'fps',
    type: 'select',
    label: 'FPS',
    defaultValue: 30,
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
    defaultValue: 30,
    min: 15,
    max: 60,
    step: 5,
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
