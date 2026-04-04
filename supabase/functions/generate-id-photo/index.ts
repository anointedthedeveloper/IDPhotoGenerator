import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, photoType = 'half', backgroundColor = 'white', aspectRatio = '3:4' } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiApiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const aiBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!aiApiKey || !aiBaseUrl) {
      return new Response(JSON.stringify({ error: 'OnSpace AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate base64 image
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format. Expected base64 data URL.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const bgDesc =
      backgroundColor === 'white' ? 'plain white'
      : backgroundColor === 'gray' ? 'neutral gray'
      : backgroundColor === 'blue' ? 'light blue'
      : backgroundColor;

    const frameDesc =
      photoType === 'full'
        ? 'full body standing straight, head to toe, hands at sides'
        : 'half body portrait, head and shoulders, waist up';

    const prompt = `You are a professional ID photo editor. Transform the provided photo into a formal passport/ID photo with these exact specifications:
- Preserve the person's exact facial features, skin tone, ethnicity, and age
- ${frameDesc}
- Professional attire: navy blue business suit, white shirt, tie for men / formal blazer for women
- Background: solid ${bgDesc} background, completely uniform
- Pose: front facing, neutral expression, eyes open and looking forward
- Lighting: soft, even studio lighting, no harsh shadows
- Sharp focus, high resolution, photorealistic quality
- Standard passport/ID photo composition and proportions

Transform the uploaded photo accordingly.`;

    console.log('Calling OnSpace AI for image generation...');

    const requestBody = {
      model: 'google/gemini-2.5-flash-image',
      modalities: ['image', 'text'],
      image_config: {
        aspect_ratio: aspectRatio === '1:1' ? '1:1' : '3:4',
        image_size: '1K',
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    };

    const aiRes = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OnSpace AI status:', aiRes.status);

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('OnSpace AI error:', errText);
      return new Response(JSON.stringify({ error: `OnSpace AI error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await aiRes.json();
    console.log('OnSpace AI response received');

    const generatedImageUrl = aiResult?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!generatedImageUrl) {
      console.error('No image in response:', JSON.stringify(aiResult).substring(0, 500));
      return new Response(JSON.stringify({ error: 'No image returned from OnSpace AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optionally store to Supabase storage
    let storedUrl: string | null = null;
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Convert base64 data URL to bytes for upload
        const base64DataMatch = generatedImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (base64DataMatch) {
          const imgBytes = Uint8Array.from(atob(base64DataMatch[2]), c => c.charCodeAt(0));
          const fileName = `generated/${crypto.randomUUID()}.png`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('id-photos')
            .upload(fileName, imgBytes, { contentType: 'image/png', cacheControl: '3600', upsert: false });

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(uploadData.path);
            storedUrl = urlData.publicUrl;
            console.log('Stored generated image:', storedUrl);
          }
        }
      } catch (e) {
        console.log('Storage upload failed (non-fatal):', e.message);
      }
    }

    const textContent = aiResult?.choices?.[0]?.message?.content ?? '';
    const description = `Professional ID photo — ${photoType} body, ${backgroundColor} background`;

    return new Response(
      JSON.stringify({
        image: generatedImageUrl,
        stored_url: storedUrl,
        description,
        text: textContent,
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
