
import { ReplicateResponse, ReplicateModel, ReplicateModelDetails } from "@/lib/replicateTypes";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_NAME = "replicate-api";

export async function callReplicateModel(
  modelVersion: string, 
  input: Record<string, any>
): Promise<ReplicateResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { modelVersion, input }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as ReplicateResponse;
  } catch (error) {
    console.error("Error calling Replicate API:", error);
    throw error;
  }
}

export async function checkPredictionStatus(predictionId: string): Promise<ReplicateResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { predictionId }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as ReplicateResponse;
  } catch (error) {
    console.error("Error checking prediction status:", error);
    throw error;
  }
}

export async function fetchReplicateModels(options?: {
  filter?: "video";
  page?: number;
  pageSize?: number;
  allowList?: string[];
}): Promise<{ results: ReplicateModel[], next?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { 
        fetchModels: true,
        filter: options?.filter,
        page: options?.page,
        pageSize: options?.pageSize,
        allowList: options?.allowList
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching Replicate models:", error);
    throw error;
  }
}

export async function fetchModelDetails(modelId: string): Promise<ReplicateModelDetails> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { 
        fetchModels: true,
        modelId
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.modelDetails;
  } catch (error) {
    console.error(`Error fetching details for model ${modelId}:`, error);
    throw error;
  }
}
