import { corsHeaders } from '../_shared/cors.ts';

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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
        JSON.stringify({ error: 'HF_TOKEN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bgDesc = backgroundColor === 'white' ? 'pure white background'
      : backgroundColor === 'gray' ? 'neutral gray background'
      : 'light blue background';
    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe'
      : 'half body portrait, head and shoulders, waist up';

    const prompt = `professional passport ID photo, ${frameDesc}, formal business suit, ${bgDesc}, soft studio lighting, sharp focus, centered composition, looking directly at camera, photorealistic, high quality, 4k`;
    const negativePrompt = 'cartoon, anime, blurry, dark background, casual clothes, sunglasses, hat, watermark, text, low quality, deformed face, multiple people';

    console.log('Starting generation, photoType:', photoType, 'bg:', backgroundColor);

    // Use flux-schnell — fast, free, and working on HF
    const models = [
      'black-forest-labs/FLUX.1-schnell',
      'stabilityai/stable-diffusion-3-medium-diffusers',
      'stabilityai/stable-diffusion-xl-base-1.0',
    ];

    let finalBytes: Uint8Array | null = null;
    let outputMime = 'image/jpeg';

    for (const model of models) {
      console.log('Trying model:', model);

      try {
        const response = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'x-wait-for-model': 'true',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                negative_prompt: negativePrompt,
                num_inference_steps: 20,
                guidance_scale: 7.5,
                width: 512,
                height: 680,
              },
            }),
          }
        );

        console.log('Model', model, 'status:', response.status);

        if (!response.ok) {
          const errText = await response.text();
          console.log('Model failed:', errText.substring(0, 150));
          continue;
        }

        const contentType = response.headers.get('content-type') ?? '';
        const bytes = new Uint8Array(await response.arrayBuffer());
        const preview = new TextDecoder().decode(bytes.slice(0, 100));

        if (preview.trimStart().startsWith('{')) {
          console.log('Got JSON instead of image:', preview);
          continue;
        }

        finalBytes = bytes;
        outputMime = contentType.includes('png') ? 'image/png' : 'image/jpeg';
        console.log('Success with model:', model, 'size:', bytes.length);
        break;

      } catch (modelErr) {
        console.log('Model error:', modelErr.message);
        continue;
      }
    }

    if (!finalBytes) {
      return new Response(
        JSON.stringify({ error: 'All models failed. Please try again in a moment — models may be loading.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        image: `data:${outputMime};base64,${uint8ArrayToBase64(finalBytes)}`,
        description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
