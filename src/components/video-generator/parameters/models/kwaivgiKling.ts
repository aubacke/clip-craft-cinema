
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const kwaivgiKlingParameters: ModelParameterDefinition[] = [
  {
    name: 'negative_prompt',
    type: 'text',
    label: 'Negative Prompt',
    description: 'What should not be in the video',
    isAdvanced: true
  },
  {
    name: 'width',
    type: 'select',
    label: 'Width',
    defaultValue: 512,
    options: [
      { value: 512, label: '512px' },
      { value: 768, label: '768px' },
      { value: 1024, label: '1024px' }
    ],
    description: 'Width of the video'
  },
  {
    name: 'height',
    type: 'select',
    label: 'Height',
    defaultValue: 512,
    options: [
      { value: 512, label: '512px' },
      { value: 768, label: '768px' },
      { value: 1024, label: '1024px' }
    ],
    description: 'Height of the video'
  },
  {
    name: 'image',
    type: 'image',
    label: 'Reference Image',
    description: 'Optional image to guide the video generation',
    isAdvanced: false
  },
  {
    name: 'cfg_scale',
    type: 'slider',
    label: 'CFG Scale',
    defaultValue: 8,
    min: 1,
    max: 15,
    step: 0.5,
    description: 'How closely the model should follow the prompt',
    isAdvanced: true
  },
  {
    name: 'num_frames',
    type: 'slider',
    label: 'Number of Frames',
    defaultValue: 24,
    min: 12,
    max: 48,
    step: 4,
    description: 'Number of frames in the video',
    isAdvanced: true
  },
  {
    name: 'fps',
    type: 'select',
    label: 'FPS',
    defaultValue: 8,
    options: [
      { value: 8, label: '8 FPS' },
      { value: 12, label: '12 FPS' },
      { value: 24, label: '24 FPS' }
    ],
    description: 'Frames per second',
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
    name: 'model_specific.motion_strength',
    type: 'slider',
    label: 'Motion Strength',
    defaultValue: 0.5,
    min: 0.1,
    max: 1.0,
    step: 0.1,
    description: 'Strength of the motion in the video',
    isAdvanced: true
  }
];
