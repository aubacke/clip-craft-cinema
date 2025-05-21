
import { corsHeaders } from "./utils.ts";

// Check the status of an existing prediction
export async function handlePredictionCheck(
  predictionId: string, 
  apiKey: string, 
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    console.log("Checking status for prediction:", predictionId);
    
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error response:", errorText);
      
      return new Response(
        JSON.stringify({ 
          error: `Error checking prediction status: ${response.statusText}`, 
          details: errorText 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking prediction status:", error);
    return new Response(
      JSON.stringify({ error: `Error checking prediction: ${error.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
