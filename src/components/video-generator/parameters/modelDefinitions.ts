
import { ModelParameterDefinition } from '@/lib/replicateTypes';

// Define parameter definitions for each supported model
export const MODEL_PARAMETERS: Record<string, ModelParameterDefinition[]> = {
  'google/veo-2': [
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
  ],
  'kwaivgi/kling-v2.0': [
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
  ],
  'luma/ray-2-720p': [
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
  ],
  'luma/ray-flash-2-720p': [
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
  ]
};

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
