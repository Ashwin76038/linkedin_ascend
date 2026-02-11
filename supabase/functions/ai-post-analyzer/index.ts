import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a LinkedIn content analyst that helps improve posts for better engagement.

You analyze LinkedIn posts and provide:
1. Engagement score (1-10) based on hook strength, readability, value, and CTA
2. Improved version of the post
3. Specific hook improvement suggestions
4. Formatting and structure tips

Scoring criteria:
- Hook strength (0-3 points): Does it stop the scroll?
- Value delivery (0-3 points): Does reader learn something?
- Readability (0-2 points): Is it scannable with good formatting?
- Call-to-action (0-2 points): Does it encourage engagement?

Be specific and actionable in your feedback. Don't give generic advice.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { post } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!post || post.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid LinkedIn post to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userMessage = `Analyze this LinkedIn post and provide improvements:

---
${post}
---

Return a JSON object with:
- improvedVersion: A rewritten version that would perform better (keep similar length and core message)
- engagementScore: Number 1-10 based on the scoring criteria
- hookImprovements: Array of 3-4 specific suggestions to improve the opening hook
- formattingTips: Array of 3-4 specific formatting and structure improvements
- overallFeedback: 2-3 sentences summarizing the main issues and strengths

Be specific to THIS post. Reference actual content from the post in your feedback.`;

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
    console.log("Post analysis completed successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Post analyzer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
