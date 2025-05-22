
import { ModelParameterDefinition } from '@/lib/replicateTypes';

export const kwaivgiKlingProParameters: ModelParameterDefinition[] = [
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
    description: 'Things you do not want to see in the video',
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
    description: 'Aspect ratio of the video. Ignored if start_image is provided.',
    isAdvanced: false
  },
  {
    name: 'image',
    type: 'image',
    label: 'Start Image',
    description: 'First frame of the video (optional)',
    isAdvanced: false
  },
  {
    name: 'cfg_scale',
    type: 'slider',
    label: 'CFG Scale',
    defaultValue: 8,
    min: 0,
    max: 15,
    step: 0.5,
    description: 'Flexibility in video generation; The higher the value, the lower the model\'s flexibility',
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
    description: 'Random seed for reproducibility. Omit for random generation.',
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
