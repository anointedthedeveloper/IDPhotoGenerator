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

    const bgDesc = backgroundColor === 'white' ? 'pure white background'
      : backgroundColor === 'gray' ? 'neutral gray background'
      : 'light blue background';

    const frameDesc = photoType === 'full'
      ? 'full body standing straight, head to toe'
      : 'half body portrait, head and shoulders';

    const prompt = `professional ID photo, ${frameDesc}, formal business attire, ${bgDesc}, studio lighting, sharp focus, passport photo quality, centered, looking at camera, photorealistic`;
    const negativePrompt = 'cartoon, blurry, dark, casual clothes, sunglasses, hat, watermark, text, low quality';

    // Extract base64 data
    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    const base64Data = base64Match ? base64Match[2] : image;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Use multipart/form-data with correct field name for img2img
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);

    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];

    const addField = (name: string, value: string) => {
      parts.push(encoder.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
      ));
    };

    addField('prompt', prompt);
    addField('negative_prompt', negativePrompt);
    addField('strength', '0.65');
    addField('guidance_scale', '7.5');
    addField('num_inference_steps', '25');

    // Add image file part
    parts.push(encoder.encode(
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="photo.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`
    ));
    parts.push(binaryData);
    parts.push(encoder.encode(`\r\n--${boundary}--\r\n`));

    // Combine all parts
    const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
    const body = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      body.set(part, offset);
      offset += part.length;
    }

    // Try img2img first
    let response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body,
      }
    );

    // Fallback to text-to-image JSON API
    if (!response.ok) {
      const errText = await response.text();
      console.log('img2img failed:', errText, '— falling back to text2img');

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
      console.error('Final HF error:', errorText);
      return new Response(
        JSON.stringify({ error: `Generation failed: ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
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
