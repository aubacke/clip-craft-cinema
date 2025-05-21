
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const googleVeoParameters: ModelParameterDefinition[] = [
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
    defaultValue: '1:1',
    options: [
      { value: '1:1', label: '1:1 (Square)' },
      { value: '16:9', label: '16:9 (Landscape)' },
      { value: '9:16', label: '9:16 (Portrait)' }
    ],
    description: 'The aspect ratio of the video'
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
    description: 'Random seed for reproducibility. Leave blank for random',
    isAdvanced: true
  },
  {
    name: 'steps',
    type: 'slider',
    label: 'Steps',
    defaultValue: 30,
    min: 10,
    max: 50,
    step: 1,
    description: 'Number of denoising steps',
    isAdvanced: true
  },
  {
    name: 'image',
    type: 'image',
    label: 'Reference Image',
    description: 'Optional image to guide the video generation',
    isAdvanced: false
  }
];
