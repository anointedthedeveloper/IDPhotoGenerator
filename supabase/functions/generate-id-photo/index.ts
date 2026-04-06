import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, photoType, backgroundColor, aspectRatio, clothingStyle } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');

    if (!baseUrl || !apiKey) {
      throw new Error('AI service not configured');
    }

    // Concise, direct prompt for faster generation
    const clothingNote = clothingStyle === 'suit'
      ? 'Dress in dark business suit, white shirt, tie.'
      : 'Keep original clothing.';

    const bgColors: Record<string, string> = {
      white: '#FFFFFF', gray: '#9CA3AF', blue: '#3B82F6',
      red: '#EF4444', green: '#10B981', lightblue: '#38BDF8',
    };
    const bgHex = bgColors[backgroundColor] || '#FFFFFF';

    const frameNote = photoType === 'full'
      ? 'Full body head to feet, standing straight.'
      : 'Half body head to waist, passport style.';

    const prompt = `Professional ID photo. ${frameNote} Solid ${backgroundColor} (${bgHex}) background. ${clothingNote} Face centered, neutral expression, sharp quality, official document style. Keep face identical.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: aspectRatio },
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `AI service error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();

    const generatedImage = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const description = result.choices?.[0]?.message?.content || '';

    if (!generatedImage) {
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ image: generatedImage, description }),
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
