import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { handlePredictionCheck } from "./predictionStatus.ts";
import { createPrediction } from "./createPrediction.ts";
import { fetchModels, fetchModelDetails } from "./modelFetching.ts";
import { validateApiKey } from "./auth.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    
    if (!REPLICATE_API_KEY) {
      throw new Error("REPLICATE_API_KEY not found in environment variables");
    }

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log("Request data:", JSON.stringify(requestData));

    // If predictionId is provided, check the status of that prediction
    if (requestData.predictionId) {
      return await handlePredictionCheck(requestData.predictionId, REPLICATE_API_KEY, corsHeaders);
    }

    // If fetchModels is true, get available models from Replicate
    if (requestData.fetchModels) {
      if (requestData.modelId) {
        // If a specific model ID was requested, fetch its details
        return await fetchModelDetails(
          requestData.modelId,
          REPLICATE_API_KEY,
          corsHeaders
        );
      } else {
        // Otherwise fetch models based on filters
        return await fetchModels(
          requestData.filter,
          requestData.page,
          requestData.pageSize,
          requestData.allowList,
          REPLICATE_API_KEY,
          corsHeaders
        );
      }
    }

    // If checkApiKey is true, validate the API key
    if (requestData.checkApiKey) {
      return await validateApiKey(REPLICATE_API_KEY, corsHeaders);
    }

    // Otherwise, create a new prediction
    if (!requestData.modelVersion) {
      return new Response(
        JSON.stringify({ error: "Model version is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { modelVersion, input } = requestData;
    
    if (!input || typeof input !== "object") {
      return new Response(
        JSON.stringify({ error: "Input parameters are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    return await createPrediction(modelVersion, input, REPLICATE_API_KEY, corsHeaders);

  } catch (error) {
    console.error("Error in replicate-api function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
