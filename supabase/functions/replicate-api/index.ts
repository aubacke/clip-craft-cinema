
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const requestData = await req.json();

    // If fetchModels is true, get available models from Replicate
    if (requestData.fetchModels) {
      try {
        console.log("Fetching models with params:", JSON.stringify({
          filter: requestData.filter,
          allowList: requestData.allowList
        }));
        
        const query = new URLSearchParams();
        
        // Only add filter for video-related models if specified AND we don't have an allowList
        // This is the key change - we prioritize the allowList over the filter
        if (requestData.filter === "video" && (!requestData.allowList || requestData.allowList.length === 0)) {
          console.log("Using 'video' collection filter");
          query.append("collection", "video");
        }
        
        // Add pagination parameters if provided
        if (requestData.page) {
          query.append("page", requestData.page.toString());
        }
        if (requestData.pageSize) {
          query.append("page_size", requestData.pageSize.toString());
        }
        
        const queryString = query.toString() ? `?${query.toString()}` : "";
        console.log(`Making request to: https://api.replicate.com/v1/models${queryString}`);

        const response = await fetch(`https://api.replicate.com/v1/models${queryString}`, {
          headers: {
            Authorization: `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Replicate API error:", response.status, errorData);
          throw new Error(`Failed to fetch models: ${response.statusText}, Details: ${errorData}`);
        }

        const modelsData = await response.json();
        console.log(`Received ${modelsData.results ? modelsData.results.length : 0} models before filtering`);
        
        // If a specific model ID was requested, fetch its versions too
        if (requestData.modelId) {
          const modelVersionsResponse = await fetch(`https://api.replicate.com/v1/models/${requestData.modelId}`, {
            headers: {
              Authorization: `Token ${REPLICATE_API_KEY}`,
              "Content-Type": "application/json",
            },
          });
          
          if (!modelVersionsResponse.ok) {
            throw new Error(`Failed to fetch model versions: ${modelVersionsResponse.statusText}`);
          }
          
          const modelDetails = await modelVersionsResponse.json();
          
          return new Response(JSON.stringify({ 
            modelDetails 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Filter models if allowList is provided
        let results = modelsData.results || [];
        
        if (requestData.allowList && Array.isArray(requestData.allowList) && requestData.allowList.length > 0) {
          console.log(`Filtering by allowList: ${requestData.allowList.join(', ')}`);
          
          // Direct filtering approach for the allowlisted models
          const filteredResults = [];
          
          for (const modelId of requestData.allowList) {
            try {
              console.log(`Fetching specific model: ${modelId}`);
              const modelResponse = await fetch(`https://api.replicate.com/v1/models/${modelId}`, {
                headers: {
                  Authorization: `Token ${REPLICATE_API_KEY}`,
                  "Content-Type": "application/json",
                },
              });
              
              if (modelResponse.ok) {
                const modelData = await modelResponse.json();
                console.log(`Successfully fetched model: ${modelId}`);
                filteredResults.push(modelData);
              } else {
                console.error(`Failed to fetch model ${modelId}: ${modelResponse.statusText}`);
              }
            } catch (err) {
              console.error(`Error fetching model ${modelId}:`, err);
            }
          }
          
          results = filteredResults;
          console.log(`Final filtered results count: ${results.length}`);
        }
        
        // Format the response to match what the frontend expects
        return new Response(JSON.stringify({
          results: results,
          next: modelsData.next || null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error in fetchModels:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // If checkApiKey is true, validate the API key by making a simple API call
    if (requestData.checkApiKey) {
      try {
        const response = await fetch("https://api.replicate.com/v1/models", {
          headers: {
            Authorization: `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Invalid API key or API connection issue");
        }

        return new Response(JSON.stringify({ valid: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ valid: false, error: error.message }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // If predictionId is provided, check the status of that prediction
    if (requestData.predictionId) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${requestData.predictionId}`, {
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to check prediction status");
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Otherwise, create a new prediction
    const { modelVersion, input } = requestData;
    
    if (!modelVersion) {
      throw new Error("Model version is required");
    }

    // Call the Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to call Replicate API");
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
