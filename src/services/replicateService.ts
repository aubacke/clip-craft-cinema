
import { ReplicateResponse, ReplicateModel, ReplicateModelDetails } from "@/lib/replicateTypes";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_NAME = "replicate-api";

export async function callReplicateModel(
  modelVersion: string, 
  input: Record<string, any>,
  imageFile?: File | null
): Promise<ReplicateResponse> {
  try {
    // Handle image upload if provided
    let imageUrl: string | undefined;
    
    if (imageFile) {
      imageUrl = await uploadAndGetImageUrl(imageFile);
      // Add the image URL to the input
      input.image = imageUrl;
    }
    
    console.log("Calling Replicate API with version:", modelVersion);
    console.log("Input:", JSON.stringify(input));
    
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { modelVersion, input }
    });

    if (error) {
      console.error("Function invoke error:", error);
      throw new Error(error.message || "Error calling Replicate API");
    }

    if (!data) {
      throw new Error("No data returned from Replicate API");
    }

    return data as ReplicateResponse;
  } catch (error) {
    console.error("Error calling Replicate API:", error);
    throw error;
  }
}

async function uploadAndGetImageUrl(file: File): Promise<string> {
  // Convert the file to a base64 string to send to the edge function
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
  });
}

export async function checkPredictionStatus(predictionId: string): Promise<ReplicateResponse> {
  try {
    console.log("Checking status for prediction:", predictionId);
    
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { predictionId }
    });

    if (error) {
      console.error("Function invoke error:", error);
      throw new Error(error.message || "Error checking prediction status");
    }

    if (!data) {
      throw new Error("No data returned when checking prediction status");
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
    console.log("Fetching models with options:", options);
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
      console.error("Error from Supabase function:", error);
      throw new Error(error.message);
    }

    console.log(`Received ${data?.results?.length || 0} models from API`);
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
