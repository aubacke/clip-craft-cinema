
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

export async function checkPredictionStatus(url: string): Promise<ReplicateResponse> {
  const apiKey = localStorage.getItem('replicateApiKey');
  
  if (!apiKey) {
    throw new Error("Replicate API key not found");
  }
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${apiKey}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Failed to check prediction status");
  }
  
  return response.json();
}
