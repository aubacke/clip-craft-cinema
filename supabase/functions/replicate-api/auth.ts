
import { corsHeaders } from "./utils.ts";

// Validate the API key by making a simple API call
export async function validateApiKey(
  apiKey: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const response = await fetch("https://api.replicate.com/v1/models", {
      headers: {
        Authorization: `Token ${apiKey}`,
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
