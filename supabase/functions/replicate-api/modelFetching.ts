
import { corsHeaders } from "./utils.ts";

// Fetch models list with optional filtering
export async function fetchModels(
  filter: string | undefined,
  page: number | undefined,
  pageSize: number | undefined,
  allowList: string[] | undefined,
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    console.log("Fetching models with params:", JSON.stringify({
      filter: filter,
      allowList: allowList
    }));
    
    const query = new URLSearchParams();
    
    // Only add filter for video-related models if specified AND we don't have an allowList
    if (filter === "video" && (!allowList || allowList.length === 0)) {
      console.log("Using 'video' collection filter");
      query.append("collection", "video");
    }
    
    // Add pagination parameters if provided
    if (page) {
      query.append("page", page.toString());
    }
    if (pageSize) {
      query.append("page_size", pageSize.toString());
    }
    
    const queryString = query.toString() ? `?${query.toString()}` : "";
    console.log(`Making request to: https://api.replicate.com/v1/models${queryString}`);

    const response = await fetch(`https://api.replicate.com/v1/models${queryString}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Replicate API error response:", response.status, errorData);
      throw new Error(`Failed to fetch models: ${response.statusText}, Details: ${errorData}`);
    }

    const modelsData = await response.json();
    console.log(`Received ${modelsData.results ? modelsData.results.length : 0} models before filtering`);
    
    // Filter models if allowList is provided
    let results = modelsData.results || [];
    
    if (allowList && Array.isArray(allowList) && allowList.length > 0) {
      console.log(`Filtering by allowList: ${allowList.join(', ')}`);
      
      // Direct filtering approach for the allowlisted models
      const filteredResults = [];
      
      for (const modelId of allowList) {
        try {
          console.log(`Fetching specific model: ${modelId}`);
          const modelResponse = await fetch(`https://api.replicate.com/v1/models/${modelId}`, {
            headers: {
              Authorization: `Token ${apiKey}`,
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

// Fetch details for a specific model
export async function fetchModelDetails(
  modelId: string,
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const modelVersionsResponse = await fetch(`https://api.replicate.com/v1/models/${modelId}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
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
  } catch (error) {
    console.error(`Error fetching model details for ${modelId}:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
