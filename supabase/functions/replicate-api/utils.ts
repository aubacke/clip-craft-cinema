
// CORS headers for all responses
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to upload a base64 image to a temporary service
export async function uploadBase64ImageToTemp(base64Data: string): Promise<string> {
  // Using ImgBB as a temporary image host
  // In a production app, you'd use a more reliable service or your own storage
  const apiKey = "7105a2cab2cf9f3e8b46550f49674205"; // Free ImgBB API key for demo purposes
  
  // Extract the base64 data part if it's a data URL
  let base64Only = base64Data;
  if (base64Data.includes(',')) {
    base64Only = base64Data.split(',')[1];
  }
  
  const formData = new FormData();
  formData.append('image', base64Only);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image to temporary storage');
  }
  
  const data = await response.json();
  if (!data.data || !data.data.url) {
    throw new Error('Invalid response from image upload service');
  }
  
  return data.data.url;
}
