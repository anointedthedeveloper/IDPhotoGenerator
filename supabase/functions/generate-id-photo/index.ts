import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, photoType, backgroundColor, aspectRatio } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('HF_TOKEN');
    if (!apiKey) throw new Error('HF_TOKEN is not configured');

    // Convert base64 data URL to binary
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    const mimeType = base64Match ? `image/${base64Match[1]}` : 'image/jpeg';
    const base64Data = base64Match ? base64Match[2] : image;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageBlob = new Blob([binaryData], { type: mimeType });

    const bgDesc = backgroundColor === 'white' ? 'pure white background'
      : backgroundColor === 'gray' ? 'neutral gray background'
      : 'light blue background';

    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe visible'
      : 'half body portrait, head and shoulders, waist up';

    const prompt = `professional ID photo, ${frameDesc}, formal business attire, ${bgDesc}, studio lighting, sharp focus, passport photo quality, centered, looking at camera, photorealistic, high quality`;
    const negativePrompt = 'cartoon, blurry, dark, shadow, casual clothes, sunglasses, hat, watermark, text, low quality, deformed';

    // Build multipart form for img2img
    const formData = new FormData();
    formData.append('inputs', imageBlob, 'photo.jpg');
    formData.append('parameters', JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      strength: 0.6,
      guidance_scale: 7.5,
      num_inference_steps: 30,
    }));

    // Try img2img with stable-diffusion-v1-5
    let response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      }
    );

    // Fallback: text-to-image if img2img fails
    if (!response.ok) {
      console.log('img2img failed, trying text-to-image fallback...');
      response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: negativePrompt,
              num_inference_steps: 25,
              guidance_scale: 7.5,
            },
          }),
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API Error:', errorText);
      return new Response(
        JSON.stringify({ error: `Image generation failed: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') ?? '';

    // Handle JSON error response from HF
    if (contentType.includes('application/json')) {
      const json = await response.json();
      if (json.error) {
        return new Response(
          JSON.stringify({ error: json.error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const imageBuffer = await response.arrayBuffer();
    const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const outputMime = contentType.includes('png') ? 'image/png' : 'image/jpeg';

    return new Response(
      JSON.stringify({
        image: `data:${outputMime};base64,${resultBase64}`,
        description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
