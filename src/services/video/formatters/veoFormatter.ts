
import { VideoGenerationParameters } from '@/lib/replicateTypes';
import { ModelFormatter } from '../types';

export const veoFormatter: ModelFormatter = {
  formatInputs: (parameters: VideoGenerationParameters): Record<string, any> => {
    const inputParams: Record<string, any> = {
      prompt: parameters.prompt
    };
    
    if (parameters.negative_prompt) {
      inputParams.negative_prompt = parameters.negative_prompt;
    }
    
    // Image parameter for Veo is simply 'image'
    if (parameters.image_url) {
      inputParams.image = parameters.image_url;
    }
    
    // Add duration parameter (seconds)
    if (parameters.duration) {
      inputParams.duration = parameters.duration;
    }
    
    // Add aspect_ratio parameter directly
    if (parameters.aspect_ratio) {
      inputParams.aspect_ratio = parameters.aspect_ratio;
    } else {
      // Only calculate width/height if aspect_ratio isn't provided
      if (parameters.width) inputParams.width = parameters.width;
      if (parameters.height) inputParams.height = parameters.height;
    }
    
    if (parameters.cfg_scale) inputParams.cfg_scale = parameters.cfg_scale;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    if (parameters.steps) inputParams.num_inference_steps = parameters.steps;
    
    return inputParams;
  }
};
