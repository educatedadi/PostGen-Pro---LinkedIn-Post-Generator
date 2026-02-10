import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FREE_GENERATIONS = 3;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { topic, tone = "professional", sessionId } = body;
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Validate topic input
    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedTopic = topic.trim();
    if (trimmedTopic.length < 3) {
      return new Response(
        JSON.stringify({ error: "Topic must be at least 3 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedTopic.length > 500) {
      return new Response(
        JSON.stringify({ error: "Topic must be less than 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate session ID format
    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Session ID must match expected format: session_<timestamp>_<random>
    if (!sessionId.match(/^session_\d{10,15}_[a-z0-9]{8,20}$/)) {
      return new Response(
        JSON.stringify({ error: "Invalid session ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for backend operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check for authenticated user from the authorization header
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      // Try to get user from token
      const anonClient = createClient(SUPABASE_URL!, Deno.env.get("SUPABASE_ANON_KEY")!);
      const { data: { user } } = await anonClient.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    // Check usage limits using the database function
    const { data: usageResult, error: usageError } = await supabase.rpc(
      'check_and_increment_usage',
      {
        p_session_id: sessionId,
        p_user_id: userId,
        p_max_free_generations: MAX_FREE_GENERATIONS
      }
    );

    if (usageError) {
      console.error("Usage check error:", usageError);
      throw new Error("Failed to check usage limits");
    }

    // If user can't generate, return limit reached error
    if (!usageResult.can_generate) {
      return new Response(
        JSON.stringify({ 
          error: "Free limit reached",
          limitReached: true,
          generationCount: usageResult.generation_count,
          message: "You've used all 3 free generations. Sign in with Google for unlimited access!"
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build tone-specific instructions
    const toneInstructions: Record<string, string> = {
      professional: "Use a professional, authoritative tone. Focus on insights, data, and expertise.",
      inspirational: "Use an inspiring, motivational tone. Include personal stories and uplifting messages.",
      humorous: "Use a light, witty tone with clever observations. Keep it professional but entertaining.",
      educational: "Use an informative, teaching tone. Break down concepts and provide actionable tips.",
    };

    const systemPrompt = `You are an expert LinkedIn content strategist. Create ONE engaging, viral LinkedIn post based on the given topic.

TONE: ${tone.toUpperCase()}
${toneInstructions[tone] || toneInstructions.professional}

Your post should:
1. Include relevant emojis (but not overuse them)
2. Include 3-5 trending hashtags
3. Be optimized for LinkedIn's algorithm
4. Be between 1200-2500 characters for optimal engagement
5. Include a hook that grabs attention in the first 2 lines
6. Use line breaks effectively for readability

Also generate an AI image prompt that would create a professional visual to accompany the post.

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "post": {
    "content": "The full LinkedIn post text with emojis and hashtags",
    "imagePrompt": "A detailed prompt for AI image generation that matches the post theme"
  }
}`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate a ${tone} LinkedIn post about: "${trimmedTopic}"`,
              },
            ],
          },
        ],
      }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("Failed to generate post");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON response from the AI
    let post;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        post = parsed.post || parsed;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Include usage info in response
    return new Response(JSON.stringify({
      post,
      usage: {
        generationCount: usageResult.generation_count,
        remaining: usageResult.remaining,
        isAuthenticated: usageResult.is_authenticated
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
