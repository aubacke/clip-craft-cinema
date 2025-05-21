
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
    
    if (parameters.image_url) {
      inputParams.image = parameters.image_url;
    }
    
    if (parameters.aspect_ratio) {
      const [width, height] = parameters.aspect_ratio.split(':').map(Number);
      if (width && height) {
        const ratio = width / height;
        if (ratio > 1) { // Landscape
          inputParams.width = 768;
          inputParams.height = Math.floor(768 / ratio);
        } else { // Portrait or square
          inputParams.height = 768;
          inputParams.width = Math.floor(768 * ratio);
        }
      }
    }
    
    if (parameters.cfg_scale) inputParams.cfg_scale = parameters.cfg_scale;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    if (parameters.steps) inputParams.num_inference_steps = parameters.steps;
    
    return inputParams;
  }
};
