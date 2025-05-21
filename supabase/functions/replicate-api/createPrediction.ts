
import { corsHeaders, uploadBase64ImageToTemp } from "./utils.ts";

// Create a new prediction
export async function createPrediction(
  modelVersion: string,
  input: Record<string, any>,
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    // Process image if it's included as base64
    const processedInput = { ...input };
    
    // If input contains a base64 image, upload it to a temporary URL
    if (input.image && typeof input.image === 'string' && 
        (input.image.startsWith('data:image') || 
        (input.image.length > 1000 && !input.image.startsWith('http')))) {
      
      try {
        console.log("Processing base64 image");
        const tempUrl = await uploadBase64ImageToTemp(input.image);
        processedInput.image = tempUrl;
        console.log("Uploaded image to temp URL:", tempUrl);
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to process the uploaded image" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    console.log(`Creating prediction with model version: ${modelVersion}`);
    console.log("Input parameters:", JSON.stringify(processedInput));

    // Call the Replicate API
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input: processedInput,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Replicate API error response:", errorData);
      
      return new Response(
        JSON.stringify({ 
          error: `Replicate API error: ${response.statusText}`, 
          details: errorData 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    const data = await response.json();
    console.log("Prediction created successfully:", data.id);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (apiError) {
    console.error("Error calling Replicate API:", apiError);
    return new Response(
      JSON.stringify({ error: `Failed to call Replicate API: ${apiError.message}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
