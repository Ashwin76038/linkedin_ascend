import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a LinkedIn profile optimization expert focused on recruiter attraction, keyword optimization, and natural professional tone.

Your task is to optimize LinkedIn profiles to:
1. Attract recruiters and hiring managers
2. Include relevant industry keywords for better searchability
3. Sound professional yet authentic and human
4. Highlight achievements and value proposition clearly
5. Use action verbs and quantifiable results where possible

Guidelines:
- Keep headlines under 120 characters but impactful
- About sections should be 2000 characters max, using short paragraphs
- Avoid buzzwords like "guru", "ninja", "rockstar"
- Focus on value delivered, not just responsibilities
- Use first person for about section to feel personal
- Include a clear call-to-action at the end of about section`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headline, about, skills, experience } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `Please optimize this LinkedIn profile:

Current Headline: ${headline || "Not provided"}

Current About Section: ${about || "Not provided"}

Skills: ${skills || "Not provided"}

Experience: ${experience || "Not provided"}

Return a JSON object with these fields:
- optimizedHeadline: Improved headline (max 120 chars)
- optimizedAbout: Improved about section (max 2000 chars, use short paragraphs)
- suggestedSkills: Array of 5-8 relevant skills to add
- keywordSuggestions: Array of 5-8 industry keywords to incorporate
- recruiterSummary: A 2-3 sentence summary optimized for recruiters`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    const result = JSON.parse(content);
    console.log("Profile optimization completed successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Profile optimizer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
