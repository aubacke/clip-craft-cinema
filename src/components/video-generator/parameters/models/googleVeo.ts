
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const googleVeoParameters: ModelParameterDefinition[] = [
  {
    name: 'prompt',
    type: 'text',
    label: 'Prompt',
    description: 'Text prompt for video generation',
    isAdvanced: false
  },
  {
    name: 'negative_prompt',
    type: 'text',
    label: 'Negative Prompt',
    description: 'What should not be in the video',
    isAdvanced: true
  },
  {
    name: 'aspect_ratio',
    type: 'select',
    label: 'Aspect Ratio',
    defaultValue: '16:9',
    options: [
      { value: '16:9', label: '16:9 (Landscape)' },
      { value: '9:16', label: '9:16 (Portrait)' },
      { value: '1:1', label: '1:1 (Square)' }
    ],
    description: 'Video aspect ratio',
    isAdvanced: false
  },
  {
    name: 'duration',
    type: 'select',
    label: 'Duration',
    defaultValue: 5,
    options: [
      { value: 2, label: '2 seconds' },
      { value: 3, label: '3 seconds' },
      { value: 4, label: '4 seconds' },
      { value: 5, label: '5 seconds' }
    ],
    description: 'Video duration in seconds',
    isAdvanced: false
  },
  {
    name: 'image',
    type: 'image',
    label: 'Reference Image',
    description: 'Input image to guide video generation',
    isAdvanced: false
  },
  {
    name: 'cfg_scale',
    type: 'slider',
    label: 'CFG Scale',
    defaultValue: 7,
    min: 1,
    max: 15,
    step: 0.5,
    description: 'How closely the model should follow the prompt',
    isAdvanced: true
  },
  {
    name: 'seed',
    type: 'number',
    label: 'Seed',
    description: 'Random seed for reproducibility. Omit for random generation.',
    isAdvanced: true
  }
];
