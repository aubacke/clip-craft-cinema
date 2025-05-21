
import { Video } from '../../lib/types';
import { VideoGenerationParameters } from '../../lib/replicateTypes';

// Types for model formatting
export interface ModelFormatter {
  formatInputs: (parameters: VideoGenerationParameters) => Record<string, any>;
}
