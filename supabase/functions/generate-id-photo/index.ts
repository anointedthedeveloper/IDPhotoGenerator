import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, photoType = 'half', backgroundColor = 'white' } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const stablecogKey = Deno.env.get('STABLECOG_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stablecogKey) {
      return new Response(JSON.stringify({ error: 'STABLECOG_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase storage to get a public URL
    let initImageUrl: string | null = null;
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const filename = `temp/init_${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from('id-photos')
          .upload(filename, imageBytes, { contentType: mimeType, upsert: true });

        if (!error && data) {
          const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(data.path);
          initImageUrl = urlData.publicUrl;
          console.log('Uploaded init image:', initImageUrl);
        }
      } catch (e) {
        console.log('Upload failed:', e.message);
      }
    }

    const bgDesc = backgroundColor === 'white' ? 'plain white' : backgroundColor === 'gray' ? 'neutral gray' : 'light blue';
    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe, hands at sides'
      : 'half body portrait, head and shoulders, waist up';

    const prompt = `professional passport ID photo of the same person, preserve exact face skin tone ethnicity age, ${frameDesc}, navy blue business suit, white shirt, tie, ${bgDesc} background, front facing, neutral expression, soft studio lighting, sharp focus, photorealistic, high quality`;

    const requestBody: any = {
      prompt,
      guidance_scale: 10,
      inference_steps: 40,
      width: 512,
      height: 680,
    };

    if (initImageUrl) {
      requestBody.init_image_url = initImageUrl;
      requestBody.prompt_strength = 0.3;
      console.log('Using img2img with init_image_url');
    } else {
      console.log('No init image URL, using text2img');
    }

    console.log('Calling Stablecog...');
    const res = await fetch('https://api.stablecog.com/v1/image/generation/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stablecogKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Stablecog status:', res.status);

    if (!res.ok) {
      const err = await res.text();
      console.error('Stablecog error:', err);
      return new Response(JSON.stringify({ error: `Stablecog error: ${err}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const result = await res.json();
    console.log('Stablecog result:', JSON.stringify(result).substring(0, 200));

    const outputUrl = result.outputs?.[0]?.image_url;
    if (!outputUrl) {
      return new Response(JSON.stringify({ error: 'No image in response' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Download and convert to base64
    const imgRes = await fetch(outputUrl);
    const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < imgBytes.length; i += chunkSize) {
      binary += String.fromCharCode(...imgBytes.subarray(i, i + chunkSize));
    }
    const resultBase64 = btoa(binary);
    const ct = imgRes.headers.get('content-type') ?? 'image/jpeg';

    console.log('Success! Credits remaining:', result.remaining_credits);

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
