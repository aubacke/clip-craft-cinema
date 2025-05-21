
import { ReplicateResponse } from "@/lib/replicateTypes";
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
