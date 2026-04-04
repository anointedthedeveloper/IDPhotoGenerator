import { corsHeaders } from '../_shared/cors.ts';

// Deno-compatible base64 decode
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { image, photoType = 'half', backgroundColor = 'white' } = body;

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('HF_TOKEN');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'HF_TOKEN secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bgDesc = backgroundColor === 'white' ? 'pure white background'
      : backgroundColor === 'gray' ? 'neutral gray background'
      : 'light blue background';

    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe'
      : 'half body portrait, head and shoulders';

    const prompt = `professional ID photo, ${frameDesc}, formal business attire, ${bgDesc}, studio lighting, sharp focus, passport photo quality, centered, looking at camera, photorealistic`;

    // Extract base64
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format, expected base64 data URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];
    const imageBytes = base64ToUint8Array(base64Data);
    const imageBlob = new Blob([imageBytes], { type: mimeType });

    console.log('Calling HuggingFace img2img, image size:', imageBytes.length, 'bytes');

    // Build multipart form
    const form = new FormData();
    form.append('inputs', imageBlob, 'photo.jpg');
    form.append('parameters', JSON.stringify({
      prompt,
      negative_prompt: 'cartoon, blurry, dark, casual clothes, sunglasses, hat, watermark, text, low quality',
      strength: 0.65,
      guidance_scale: 7.5,
      num_inference_steps: 20,
    }));

    let response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: form,
      }
    );

    console.log('img2img status:', response.status);

    // Fallback to text2img
    if (!response.ok) {
      const errText = await response.text();
      console.log('img2img failed:', errText, '— trying text2img fallback');

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
              negative_prompt: 'cartoon, blurry, dark, casual clothes, watermark, text, low quality',
              num_inference_steps: 20,
              guidance_scale: 7.5,
            },
          }),
        }
      );

      console.log('text2img status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('All HF attempts failed:', errorText);
      return new Response(
        JSON.stringify({ error: `HuggingFace error: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    console.log('Response content-type:', contentType);

    // Check if HF returned a JSON error
    if (contentType.includes('application/json')) {
      const json = await response.json();
      console.error('HF JSON error response:', JSON.stringify(json));
      return new Response(
        JSON.stringify({ error: json.error ?? JSON.stringify(json) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(imageBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const resultBase64 = btoa(binary);
    const outputMime = contentType.includes('png') ? 'image/png' : 'image/jpeg';

    console.log('Success! Output size:', bytes.length, 'bytes');

    return new Response(
      JSON.stringify({
        image: `data:${outputMime};base64,${resultBase64}`,
        description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
