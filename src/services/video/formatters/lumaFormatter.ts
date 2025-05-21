
import { VideoGenerationParameters } from '@/lib/replicateTypes';
import { ModelFormatter } from '../types';

export const lumaFormatter: ModelFormatter = {
  formatInputs: (parameters: VideoGenerationParameters): Record<string, any> => {
    const inputParams: Record<string, any> = {
      prompt: parameters.prompt
    };
    
    if (parameters.negative_prompt) {
      inputParams.negative_prompt = parameters.negative_prompt;
    }
    
    if (parameters.image_url) {
      inputParams.start_image_url = parameters.image_url;
    }
    
    // Add duration parameter (seconds)
    if (parameters.duration) inputParams.duration = parameters.duration;
    
    // Add aspect_ratio parameter
    if (parameters.aspect_ratio) inputParams.aspect_ratio = parameters.aspect_ratio;
    
    // Add specific camera concepts if provided
    if (parameters.model_specific?.concepts && Array.isArray(parameters.model_specific.concepts)) {
      inputParams.concepts = parameters.model_specific.concepts;
    }
    
    // Add loop parameter if provided
    if (parameters.model_specific?.loop !== undefined) {
      inputParams.loop = parameters.model_specific.loop;
    }
    
    if (parameters.fps) inputParams.fps = parameters.fps;
    if (parameters.seed && !parameters.use_randomized_seed) inputParams.seed = parameters.seed;
    
    return inputParams;
  }
};
