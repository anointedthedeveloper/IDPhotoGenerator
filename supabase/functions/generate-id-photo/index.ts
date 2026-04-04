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
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
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
    const frameDesc = photoType === 'full' ? 'full body standing straight' : 'half body portrait, head and shoulders';
    const prompt = `professional ID photo, ${frameDesc}, formal business attire, ${bgDesc}, studio lighting, sharp focus, passport photo quality, centered, looking at camera, photorealistic`;
    const negativePrompt = 'cartoon, blurry, dark, casual clothes, sunglasses, hat, watermark, text, low quality';

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBytes = base64ToUint8Array(base64Match[2]);
    console.log('Image size:', imageBytes.length, 'bytes');

    // Build multipart manually to avoid FormData streaming issues in Deno
    const boundary = 'boundary' + Date.now();
    const nl = '\r\n';

    const promptPart = `--${boundary}${nl}Content-Disposition: form-data; name="inputs"; filename="photo.jpg"${nl}Content-Type: image/jpeg${nl}${nl}`;
    const paramsPart = `${nl}--${boundary}${nl}Content-Disposition: form-data; name="parameters"${nl}${nl}${JSON.stringify({ prompt, negative_prompt: negativePrompt, strength: 0.65, guidance_scale: 7.5, num_inference_steps: 20 })}${nl}--${boundary}--${nl}`;

    const encoder = new TextEncoder();
    const promptBytes = encoder.encode(promptPart);
    const paramsBytes = encoder.encode(paramsPart);

    const multipart = new Uint8Array(promptBytes.length + imageBytes.length + paramsBytes.length);
    multipart.set(promptBytes, 0);
    multipart.set(imageBytes, promptBytes.length);
    multipart.set(paramsBytes, promptBytes.length + imageBytes.length);

    console.log('Calling HF img2img...');
    let response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: multipart,
      }
    );

    console.log('img2img status:', response.status);

    // Read response body ONCE
    const responseBytes = new Uint8Array(await response.arrayBuffer());
    const responseText = new TextDecoder().decode(responseBytes);
    console.log('img2img response preview:', responseText.substring(0, 200));

    let finalBytes: Uint8Array | null = null;
    let outputMime = 'image/jpeg';

    if (response.ok && !responseText.startsWith('{')) {
      // Got binary image
      finalBytes = responseBytes;
      outputMime = response.headers.get('content-type')?.includes('png') ? 'image/png' : 'image/jpeg';
    } else {
      // img2img failed, try text2img
      console.log('Falling back to text2img...');
      const t2iResponse = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { negative_prompt: negativePrompt, num_inference_steps: 20, guidance_scale: 7.5 },
          }),
        }
      );

      console.log('text2img status:', t2iResponse.status);
      const t2iBytes = new Uint8Array(await t2iResponse.arrayBuffer());
      const t2iText = new TextDecoder().decode(t2iBytes);
      console.log('text2img response preview:', t2iText.substring(0, 200));

      if (!t2iResponse.ok || t2iText.startsWith('{')) {
        return new Response(
          JSON.stringify({ error: `Generation failed: ${t2iText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      finalBytes = t2iBytes;
      outputMime = t2iResponse.headers.get('content-type')?.includes('png') ? 'image/png' : 'image/jpeg';
    }

    console.log('Success! Output:', finalBytes.length, 'bytes');

    return new Response(
      JSON.stringify({
        image: `data:${outputMime};base64,${uint8ArrayToBase64(finalBytes)}`,
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
