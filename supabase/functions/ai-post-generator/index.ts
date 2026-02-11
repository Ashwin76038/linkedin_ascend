import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a professional LinkedIn content writer that produces human-like posts optimized for engagement and authenticity.

Your posts MUST:
1. Sound human and natural, NOT robotic or AI-generated
2. Use short, punchy sentences mixed with longer ones
3. Start with a compelling hook (question, bold statement, or story)
4. Include subtle storytelling elements
5. Use white space and line breaks for readability
6. Avoid emoji overload (max 3-4 per post, placed strategically)
7. Include a clear but natural call-to-action
8. Be between 150-300 words for optimal engagement

AVOID these AI writing patterns:
- "I'm thrilled to announce..."
- "Excited to share..."
- "Humbled and honored..."
- "Game-changer"
- "Leverage"
- "Synergy"
- "At the end of the day"
- Starting every sentence the same way
- Excessive exclamation marks
- Generic corporate speak

Write like a real person sharing genuine thoughts and experiences.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectName, techStack, features, purpose, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneGuidance = {
      professional: "Maintain a polished, confident tone while staying approachable",
      storytelling: "Frame the content as a journey or narrative with clear beginning, middle, end",
      motivational: "Inspire action and connection while avoiding clichés",
      casual: "Be conversational and relatable, like talking to a colleague over coffee",
      technical: "Share technical details in an accessible way, showing expertise without jargon overload",
    };

    const purposeGuidance = {
      announcement: "Focus on the impact and value, not just the news",
      job_search: "Highlight skills and openness without sounding desperate",
      personal_brand: "Establish expertise and unique perspective",
      thought_leadership: "Share insights that challenge conventional thinking",
      milestone: "Celebrate authentically while providing value to readers",
    };

    const userMessage = `Create 3 LinkedIn post variations for this project:

Project Name: ${projectName || "Personal Project"}
Tech Stack: ${techStack || "Not specified"}
Key Features: ${features || "Not specified"}
Purpose: ${purpose || "announcement"} - ${purposeGuidance[purpose as keyof typeof purposeGuidance] || purposeGuidance.announcement}
Tone: ${tone || "professional"} - ${toneGuidance[tone as keyof typeof toneGuidance] || toneGuidance.professional}

Return a JSON object with:
- posts: Array of 3 different post variations (each 150-300 words)
- hookSuggestions: Array of 3-4 alternative hook ideas
- hashtags: Array of 5-8 relevant hashtags (include the # symbol)
- ctaSuggestions: Array of 3 call-to-action options
- bestPostingTime: Recommendation for best posting time

Each post should have a different angle or approach while maintaining the core message.`;

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
    console.log("Post generation completed successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Post generator error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
