import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, photoType = 'half', backgroundColor = 'white' } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const replicateKey = Deno.env.get('REPLICATE_API_TOKEN');
    if (!replicateKey) {
      return new Response(JSON.stringify({ error: 'REPLICATE_API_TOKEN not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const bgDesc = backgroundColor === 'white' ? 'plain white' : backgroundColor === 'gray' ? 'neutral gray' : 'light blue';
    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe, hands at sides'
      : 'half body portrait, head and shoulders, waist up, no hands visible';

    const prompt = `professional passport ID photo of the same person, preserve exact face skin tone ethnicity age, ${frameDesc}, navy blue business suit, white shirt, tie, ${bgDesc} background, front facing, neutral expression, soft studio lighting, sharp focus, photorealistic, high quality`;
    const negativePrompt = 'different person, different face, different skin tone, cartoon, blurry, casual clothes, sunglasses, hat, watermark, text, low quality, deformed';

    // Upload image as data URI — Replicate accepts base64 data URIs directly
    const imageDataUri = image;

    console.log('Starting Replicate prediction...');

    // Create prediction using SDXL refiner (img2img)
    const createRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          image: imageDataUri,
          prompt,
          negative_prompt: negativePrompt,
          strength: 0.35,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        },
      }),
    });

    console.log('Replicate create status:', createRes.status);

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Replicate create error:', err);
      return new Response(JSON.stringify({ error: `Replicate error: ${err}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let prediction = await createRes.json();
    console.log('Prediction status:', prediction.status, 'id:', prediction.id);

    // Poll until done (max 120 seconds)
    let attempts = 0;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 40) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Bearer ${replicateKey}` },
      });
      prediction = await pollRes.json();
      console.log('Poll attempt', attempts + 1, 'status:', prediction.status);
      attempts++;
    }

    if (prediction.status === 'failed') {
      return new Response(JSON.stringify({ error: `Generation failed: ${prediction.error}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
      return new Response(JSON.stringify({ error: 'Generation timed out. Please try again.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // prediction.output is a URL or array of URLs
    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    console.log('Output URL:', outputUrl);

    // Download the image and convert to base64
    const imgRes = await fetch(outputUrl);
    const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < imgBytes.length; i += chunkSize) {
      binary += String.fromCharCode(...imgBytes.subarray(i, i + chunkSize));
    }
    const resultBase64 = btoa(binary);
    const ct = imgRes.headers.get('content-type') ?? 'image/jpeg';

    return new Response(
      JSON.stringify({
        image: `data:${ct};base64,${resultBase64}`,
        description: `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
