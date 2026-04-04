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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const hfKey = Deno.env.get('HF_TOKEN');

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];

    const bgDesc = backgroundColor === 'white' ? 'plain white' : backgroundColor === 'gray' ? 'neutral gray' : 'light blue';
    const frameDesc = photoType === 'full' ? 'full body from head to toe, standing straight, hands at sides' : 'half body from waist up, head and shoulders, no hands visible';

    const megaPrompt = `Transform this photo into a professional passport ID photo of the EXACT same person. Preserve all facial features exactly — same face, same skin tone, same age, same ethnicity. Front-facing, shoulders straight, neutral expression, ${frameDesc}. Wearing a navy blue suit, white shirt, and tie. ${bgDesc} background, soft studio lighting, no shadows on background, sharp focus, realistic photography, high resolution.`;
    const negativePrompt = 'different person, different face, different skin tone, cartoon, blurry, casual clothes, sunglasses, hat, watermark, text, low quality';

    // Try Gemini image models
    const geminiModels = [
      'gemini-2.5-flash-image',
      'gemini-3.1-flash-image-preview',
      'gemini-3-pro-image-preview',
    ];

    if (geminiKey) {
      for (const model of geminiModels) {
        console.log('Trying Gemini:', model);
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: megaPrompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
                generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
              }),
            }
          );

          console.log(model, 'status:', res.status);
          if (!res.ok) { const e = await res.text(); console.log(model, 'error:', e.substring(0, 150)); continue; }

          const result = await res.json();
          const parts = result.candidates?.[0]?.content?.parts ?? [];
          const imgPart = parts.find((p: any) => p.inlineData);
          const txtPart = parts.find((p: any) => p.text);

          if (imgPart) {
            console.log('Gemini success:', model);
            return new Response(
              JSON.stringify({ image: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`, description: txtPart?.text ?? 'Professional ID photo generated' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.log(model, 'no image in response:', JSON.stringify(result).substring(0, 200));
        } catch (e) { console.log(model, 'exception:', e.message); }
      }
    }

    // HuggingFace img2img fallback
    if (hfKey) {
      console.log('Trying HuggingFace img2img...');
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const imageBlob = new Blob([imageBytes], { type: mimeType });

      for (const model of ['timbrooks/instruct-pix2pix', 'stabilityai/stable-diffusion-xl-refiner-1.0']) {
        console.log('HF model:', model);
        try {
          const form = new FormData();
          form.append('inputs', imageBlob, 'photo.jpg');
          form.append('parameters', JSON.stringify({ prompt: megaPrompt, negative_prompt: negativePrompt, strength: 0.25, guidance_scale: 10, image_guidance_scale: 1.2, num_inference_steps: 50 }));

          const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${hfKey}`, 'x-wait-for-model': 'true' },
            body: form,
          });

          console.log(model, 'status:', res.status);
          if (!res.ok) { const e = await res.text(); console.log(model, 'failed:', e.substring(0, 150)); continue; }

          const bytes = new Uint8Array(await res.arrayBuffer());
          const preview = new TextDecoder().decode(bytes.slice(0, 50));
          if (preview.trimStart().startsWith('{')) { console.log(model, 'JSON error:', preview); continue; }

          const ct = res.headers.get('content-type') ?? '';
          console.log('HF success:', model);
          return new Response(
            JSON.stringify({ image: `data:${ct.includes('png') ? 'image/png' : 'image/jpeg'};base64,${uint8ArrayToBase64(bytes)}`, description: `Professional ID photo — ${photoType} body, ${backgroundColor} background` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (e) { console.log(model, 'exception:', e.message); }
      }
    }

    return new Response(
      JSON.stringify({ error: 'All generation methods failed. Please try again in a moment.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
