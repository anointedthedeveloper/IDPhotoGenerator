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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mimeType = `image/${base64Match[1]}`;
    const base64Data = base64Match[2];

    const bgDesc = backgroundColor === 'white' ? 'pure white'
      : backgroundColor === 'gray' ? 'neutral gray'
      : 'light blue';

    const frameDesc = photoType === 'full'
      ? 'full body from head to toe, standing straight'
      : 'half body from waist up, head and shoulders visible';

    const prompt = `Transform this photo into a professional ID/passport photo of the SAME person with the EXACT same face, skin tone, and facial features. Keep the person's identity completely unchanged. Apply these changes only: 1) Replace background with solid ${bgDesc} background 2) Dress the person in formal business attire (suit and tie) 3) Adjust framing to ${frameDesc} 4) Apply even studio lighting 5) Ensure the person is centered and looking at the camera. Do NOT change the person's face, age, skin color, or identity in any way.`;

    console.log('Calling Gemini imagen...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64Data } },
            ],
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    console.log('Gemini status:', response.status);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', errText);
      return new Response(
        JSON.stringify({ error: `Gemini error: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const parts = result.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData);
    const textPart = parts.find((p: any) => p.text);

    console.log('Gemini parts count:', parts.length, 'has image:', !!imagePart);

    if (!imagePart) {
      console.error('No image in response:', JSON.stringify(result).substring(0, 300));
      return new Response(
        JSON.stringify({ error: 'Gemini did not return an image. Try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        description: textPart?.text ?? `Professional ID photo — ${photoType} body, ${backgroundColor} background`,
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
