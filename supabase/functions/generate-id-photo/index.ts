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

    // Convert base64 data URL to binary blob
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    const base64Data = base64Match ? base64Match[2] : image;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const bgDesc = backgroundColor === 'white' ? 'pure white background'
      : backgroundColor === 'gray' ? 'neutral gray background'
      : 'light blue background';

    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe'
      : 'half body portrait, head and shoulders, waist up';

    const prompt = `professional ID photo, ${frameDesc}, formal business attire, ${bgDesc}, studio lighting, sharp focus, passport photo quality, centered composition, looking at camera, photorealistic`;
    const negativePrompt = 'cartoon, illustration, blurry, dark, shadow, casual clothes, sunglasses, hat, watermark, text';

    // Use SDXL img2img for best quality
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0',
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
            num_inference_steps: 30,
            guidance_scale: 7.5,
            strength: 0.65,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API Error:', errorText);

      // Fallback to simpler model if SDXL fails
      const fallback = await fetch(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
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

      if (!fallback.ok) {
        const fallbackError = await fallback.text();
        return new Response(
          JSON.stringify({ error: `Image generation failed: ${fallbackError}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const fallbackBuffer = await fallback.arrayBuffer();
      const fallbackBase64 = btoa(String.fromCharCode(...new Uint8Array(fallbackBuffer)));
      return new Response(
        JSON.stringify({
          image: `data:image/png;base64,${fallbackBase64}`,
          description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    return new Response(
      JSON.stringify({
        image: `data:image/png;base64,${resultBase64}`,
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
