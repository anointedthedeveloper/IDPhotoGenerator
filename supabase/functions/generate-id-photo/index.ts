import { corsHeaders } from '../_shared/cors.ts';

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
    const { image, photoType = 'half', backgroundColor = 'white' } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const hfKey = Deno.env.get('HF_TOKEN');
    if (!hfKey) {
      return new Response(JSON.stringify({ error: 'HF_TOKEN not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageBlob = new Blob([imageBytes], { type: mimeType });

    const bgDesc = backgroundColor === 'white' ? 'plain white' : backgroundColor === 'gray' ? 'neutral gray' : 'light blue';
    const frameDesc = photoType === 'full' ? 'full body standing straight' : 'half body, head and shoulders';

    // Mega prompt — very specific to preserve face
    const prompt = `professional passport ID photo of the same person, preserve exact face skin tone ethnicity age, ${frameDesc}, navy blue business suit white shirt tie, ${bgDesc} background, front facing, neutral expression, studio lighting, sharp focus, photorealistic, high quality`;
    const negativePrompt = 'different person, different face, different skin color, cartoon, blurry, casual clothes, sunglasses, hat, watermark, text, low quality, deformed, ugly';

    console.log('Image size:', imageBytes.length, 'bytes');

    // Models to try in order — all support img2img
    const models = [
      { id: 'lllyasviel/control_v11p_sd15_openpose', strength: 0.3 },
      { id: 'timbrooks/instruct-pix2pix', strength: 0.2 },
      { id: 'stabilityai/stable-diffusion-xl-refiner-1.0', strength: 0.25 },
    ];

    for (const { id, strength } of models) {
      console.log('Trying:', id, 'strength:', strength);
      try {
        const form = new FormData();
        form.append('inputs', imageBlob, 'photo.jpg');
        form.append('parameters', JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          strength,
          guidance_scale: 12,
          image_guidance_scale: 1.0,
          num_inference_steps: 50,
        }));

        const res = await fetch(
          `https://router.huggingface.co/hf-inference/models/${id}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfKey}`,
              'x-wait-for-model': 'true',
            },
            body: form,
          }
        );

        console.log(id, 'status:', res.status);
        if (!res.ok) {
          const e = await res.text();
          console.log(id, 'failed:', e.substring(0, 200));
          continue;
        }

        const bytes = new Uint8Array(await res.arrayBuffer());
        const preview = new TextDecoder().decode(bytes.slice(0, 80));
        if (preview.trimStart().startsWith('{')) {
          console.log(id, 'returned JSON error:', preview);
          continue;
        }

        const ct = res.headers.get('content-type') ?? '';
        console.log('Success:', id, bytes.length, 'bytes');

        return new Response(
          JSON.stringify({
            image: `data:${ct.includes('png') ? 'image/png' : 'image/jpeg'};base64,${uint8ArrayToBase64(bytes)}`,
            description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (e) {
        console.log(id, 'exception:', e.message);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ error: 'Generation failed. Models may be loading — please try again in 30 seconds.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
