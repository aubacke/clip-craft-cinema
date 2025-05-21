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
      try {
        imageUrl = await uploadAndGetImageUrl(imageFile);
        // Add the image URL to the input
        input.image = imageUrl;
      } catch (imageError) {
        console.error("Image upload error:", imageError);
        throw new Error(`Failed to upload reference image: ${imageError.message}`);
      }
    }
    
    console.log("Calling Replicate API with version:", modelVersion);
    console.log("Input:", JSON.stringify(input));
    
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { modelVersion, input }
    });

    if (error) {
      console.error("Function invoke error:", error);
      throw new Error(`Error calling Replicate API: ${error.message || "Unknown error"}`);
    }

    if (!data) {
      throw new Error("No data returned from Replicate API. Please try again.");
    }

    // Check if the data contains an error field (from the edge function)
    if (data.error) {
      console.error("Replicate API returned error:", data.error);
      throw new Error(`Replicate API error: ${data.error}`);
    }

    return data as ReplicateResponse;
  } catch (error) {
    console.error("Error calling Replicate API:", error);
    // Provide a more user-friendly message based on error type
    if (error.message.includes("403") || error.message.includes("401")) {
      throw new Error("Authentication error: Please check your Replicate API key in the Supabase secrets.");
    } else if (error.message.includes("429")) {
      throw new Error("Rate limit exceeded: You've reached the Replicate API rate limit. Please try again later.");
    } else if (error.message.includes("500")) {
      throw new Error("Replicate server error: The service is experiencing issues. Please try again later.");
    }
    // Pass through the original error if it's already well-formatted
    throw error;
  }
}

async function uploadAndGetImageUrl(file: File): Promise<string> {
  try {
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
      reader.onerror = () => reject(new Error(`File read error: ${reader.error?.message || "Unknown error"}`));
    });
  } catch (error) {
    console.error("Error in uploadAndGetImageUrl:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

export async function checkPredictionStatus(predictionId: string): Promise<ReplicateResponse> {
  try {
    console.log("Checking status for prediction:", predictionId);
    
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { predictionId }
    });

    if (error) {
      console.error("Function invoke error:", error);
      throw new Error(`Error checking prediction status: ${error.message || "Unknown error"}`);
    }

    if (!data) {
      throw new Error("No data returned when checking prediction status. The prediction may not exist.");
    }

    // Check if the data contains an error field (from the edge function)
    if (data.error) {
      console.error("Prediction status error from Replicate:", data.error);
      throw new Error(`Error checking prediction: ${data.error}`);
    }

    return data as ReplicateResponse;
  } catch (error) {
    console.error("Error checking prediction status:", error);
    // Provide more context based on error type
    if (error.message.includes("not found") || error.message.includes("404")) {
      throw new Error(`Prediction ID ${predictionId} not found. It may have been deleted or hasn't been created yet.`);
    }
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
