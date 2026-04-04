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
      : 'half body portrait, head and shoulders';

    const prompt = `professional passport ID photo of the same person, ${frameDesc}, formal business suit, ${bgDesc}, soft studio lighting, sharp focus, centered, looking at camera, photorealistic, high quality`;
    const negativePrompt = 'different person, cartoon, blurry, dark background, casual clothes, sunglasses, hat, watermark, text, low quality, deformed';

    // Extract base64
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBytes = base64ToUint8Array(base64Match[2]);
    const imageBlob = new Blob([imageBytes], { type: `image/${base64Match[1]}` });
    console.log('Image size:', imageBytes.length, 'bytes');

    // Try img2img models via new HF router
    const img2imgModels = [
      'stabilityai/stable-diffusion-xl-refiner-1.0',
      'timbrooks/instruct-pix2pix',
    ];

    let finalBytes: Uint8Array | null = null;
    let outputMime = 'image/jpeg';

    for (const model of img2imgModels) {
      console.log('Trying img2img model:', model);
      try {
        const form = new FormData();
        form.append('inputs', imageBlob, 'photo.jpg');
        form.append('parameters', JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          strength: 0.55,
          guidance_scale: 7.5,
          num_inference_steps: 20,
          image_guidance_scale: 1.5,
        }));

        const response = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'x-wait-for-model': 'true',
            },
            body: form,
          }
        );

        console.log(model, 'status:', response.status);

        if (!response.ok) {
          const err = await response.text();
          console.log(model, 'failed:', err.substring(0, 200));
          continue;
        }

        const contentType = response.headers.get('content-type') ?? '';
        const bytes = new Uint8Array(await response.arrayBuffer());
        const preview = new TextDecoder().decode(bytes.slice(0, 50));

        if (preview.trimStart().startsWith('{')) {
          console.log(model, 'returned JSON:', preview);
          continue;
        }

        finalBytes = bytes;
        outputMime = contentType.includes('png') ? 'image/png' : 'image/jpeg';
        console.log('img2img success:', model, bytes.length, 'bytes');
        break;

      } catch (e) {
        console.log(model, 'error:', e.message);
        continue;
      }
    }

    // Fallback to text2img if img2img fails
    if (!finalBytes) {
      console.log('img2img failed, falling back to text2img...');
      const t2iModels = [
        'black-forest-labs/FLUX.1-schnell',
        'stabilityai/stable-diffusion-xl-base-1.0',
      ];

      for (const model of t2iModels) {
        console.log('Trying text2img:', model);
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

          console.log(model, 'status:', response.status);
          if (!response.ok) { const e = await response.text(); console.log(model, 'failed:', e.substring(0, 150)); continue; }

          const bytes = new Uint8Array(await response.arrayBuffer());
          const preview = new TextDecoder().decode(bytes.slice(0, 50));
          if (preview.trimStart().startsWith('{')) { console.log(model, 'JSON:', preview); continue; }

          finalBytes = bytes;
          outputMime = response.headers.get('content-type')?.includes('png') ? 'image/png' : 'image/jpeg';
          console.log('text2img success:', model);
          break;
        } catch (e) {
          console.log(model, 'error:', e.message);
          continue;
        }
      }
    }

    if (!finalBytes) {
      return new Response(
        JSON.stringify({ error: 'All models failed. Models may be loading — please try again in 30 seconds.' }),
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
