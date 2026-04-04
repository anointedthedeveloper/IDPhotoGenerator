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

    const systemPrompt = `You are an ID photo generator. Your task is to transform the input image into a professional ID photo with the following requirements:

1. Change the person's wearing to suit a professional ID photo (formal attire).
2. The proportions of people in the generated image should follow the normal proportions of ID photos.
3. Photo type: ${photoType === 'full' ? 'Full body - showing the entire person from head to feet, including legs and shoes. The person should be standing straight with their full body visible in the frame' : 'Half body - head and upper torso only, typically from waist up'}.
4. Background color: ${backgroundColor} (solid, clean background).
5. Ensure proper lighting, centered composition, and professional appearance.
6. Keep the person's face clearly visible and well-lit.`;

    const userPrompt = `Transform this photo into a professional ID photo following all the requirements.`;

    console.log('Generating ID photo with settings:', { photoType, backgroundColor, aspectRatio });

    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');

    if (!baseUrl || !apiKey) {
      throw new Error('AI service not configured');
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        modalities: ['image', 'text'],
        image_config: { aspect_ratio: aspectRatio },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      return new Response(
        JSON.stringify({ error: `AI service error: ${errorText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('AI response received');

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
