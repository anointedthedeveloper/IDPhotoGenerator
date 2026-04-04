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
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    if (!hfKey) {
      return new Response(JSON.stringify({ error: 'HF_TOKEN not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];

    const bgDesc = backgroundColor === 'white' ? 'plain white' : backgroundColor === 'gray' ? 'neutral gray' : 'light blue';
    const frameDesc = photoType === 'full' ? 'full body standing straight, head to toe' : 'half body portrait, head and shoulders, waist up';

    // Step 1: Use Gemini vision to describe the person's appearance
    let personDescription = 'young adult person';
    if (geminiKey) {
      try {
        console.log('Extracting face description with Gemini...');
        const visionRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: 'Describe this person in 1 sentence for an AI image generator. Include: gender, approximate age, skin tone, hair color and style, facial features. Be specific and concise. Example: "young Black male, early 20s, dark skin, short black hair, smiling face"' },
                  { inline_data: { mime_type: mimeType, data: base64Data } },
                ],
              }],
            }),
          }
        );
        if (visionRes.ok) {
          const visionResult = await visionRes.json();
          const desc = visionResult.candidates?.[0]?.content?.parts?.[0]?.text;
          if (desc) {
            personDescription = desc.trim().replace(/\n/g, ' ');
            console.log('Person description:', personDescription);
          }
        }
      } catch (e) {
        console.log('Vision description failed:', e.message);
      }
    }

    // Step 2: Generate ID photo with FLUX using the person description
    const prompt = `professional passport ID photo, ${personDescription}, ${frameDesc}, navy blue business suit, white shirt, tie, ${bgDesc} background, front facing, neutral expression, soft studio lighting, sharp focus, photorealistic, high quality, 4k`;
    const negativePrompt = 'cartoon, anime, blurry, casual clothes, sunglasses, hat, watermark, text, low quality, deformed, multiple people, crowd';

    console.log('Generating with FLUX, prompt:', prompt.substring(0, 100));

    const models = [
      'black-forest-labs/FLUX.1-schnell',
      'stabilityai/stable-diffusion-xl-base-1.0',
    ];

    for (const model of models) {
      console.log('Trying:', model);
      try {
        const res = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfKey}`,
              'Content-Type': 'application/json',
              'x-wait-for-model': 'true',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                negative_prompt: negativePrompt,
                num_inference_steps: 25,
                guidance_scale: 7.5,
                width: 512,
                height: 680,
              },
            }),
          }
        );

        console.log(model, 'status:', res.status);
        if (!res.ok) { const e = await res.text(); console.log(model, 'failed:', e.substring(0, 150)); continue; }

        const bytes = new Uint8Array(await res.arrayBuffer());
        const preview = new TextDecoder().decode(bytes.slice(0, 50));
        if (preview.trimStart().startsWith('{')) { console.log(model, 'JSON error:', preview); continue; }

        const ct = res.headers.get('content-type') ?? '';
        console.log('Success:', model, bytes.length, 'bytes');

        return new Response(
          JSON.stringify({
            image: `data:${ct.includes('png') ? 'image/png' : 'image/jpeg'};base64,${uint8ArrayToBase64(bytes)}`,
            description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.log(model, 'exception:', e.message);
        continue;
      }
    }

    return new Response(
      JSON.stringify({ error: 'Generation failed. Please try again in 30 seconds.' }),
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
