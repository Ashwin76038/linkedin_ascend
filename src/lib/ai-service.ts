// Client-side AI service using Google Gemini API
// Falls back to smart demo content if API is unavailable

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getApiKey(): string | null {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') return null;
    return key;
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callGemini(systemPrompt: string, userMessage: string): Promise<string | null> {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const maxRetries = 2;
    const delays = [2000, 5000];

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }
                    ],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.8,
                    },
                }),
            });

            if (response.status === 429) {
                if (attempt < maxRetries) {
                    console.warn(`Rate limited (attempt ${attempt + 1}), retrying in ${delays[attempt]}ms...`);
                    await sleep(delays[attempt]);
                    continue;
                }
                console.warn('Gemini API quota exceeded, falling back to demo mode');
                return null;
            }

            if (!response.ok) {
                console.error('Gemini API error:', response.status);
                return null;
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!content) return null;
            return content;
        } catch (err) {
            console.warn('Gemini API call failed:', err);
            return null;
        }
    }
    return null;
}

// ==================== POST GENERATOR ====================

const POST_GENERATOR_PROMPT = `You are a professional LinkedIn content writer that produces human-like posts optimized for engagement and authenticity.

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

const toneGuidance: Record<string, string> = {
    professional: "Maintain a polished, confident tone while staying approachable",
    storytelling: "Frame the content as a journey or narrative with clear beginning, middle, end",
    motivational: "Inspire action and connection while avoiding clichés",
    casual: "Be conversational and relatable, like talking to a colleague over coffee",
    technical: "Share technical details in an accessible way, showing expertise without jargon overload",
};

const purposeGuidance: Record<string, string> = {
    announcement: "Focus on the impact and value, not just the news",
    job_search: "Highlight skills and openness without sounding desperate",
    personal_brand: "Establish expertise and unique perspective",
    thought_leadership: "Share insights that challenge conventional thinking",
    milestone: "Celebrate authentically while providing value to readers",
};

export interface PostGeneratorInput {
    projectName: string;
    techStack: string;
    features: string;
    purpose: string;
    tone: string;
}

export interface PostGeneratorResult {
    posts: string[];
    hookSuggestions: string[];
    hashtags: string[];
    ctaSuggestions: string[];
    bestPostingTime: string;
}

function generateDemoPosts(input: PostGeneratorInput): PostGeneratorResult {
    const name = input.projectName || 'My Project';
    const stack = input.techStack || 'modern technologies';
    const features = input.features || 'innovative features';

    return {
        posts: [
            `We spent 3 months building something we actually needed.\n\nNo venture funding. No 50-person team. Just a real problem that kept us up at night.\n\n${name} started as a weekend hack. We were frustrated with how ${features.split(',')[0]?.trim() || 'existing solutions'} worked — or didn't.\n\nSo we built our own. Using ${stack}.\n\nHere's the thing nobody tells you about building in public:\n\n→ Your first version will embarrass you\n→ Users don't care about your tech stack\n→ Speed beats perfection every single time\n→ The best feedback comes from the harshest critics\n\nAfter dozens of iterations, ${name} now helps real people solve real problems.\n\nThe biggest lesson? Stop building features nobody asked for. Talk to your users first.\n\nWhat's a project you built that started as a "quick hack"? 👇`,

            `"That's impossible to build."\n\nThat's what I heard when I pitched ${name} to my team.\n\n6 months later, it's live and growing.\n\nThe secret wasn't some revolutionary technology. It was stubbornness.\n\nWe chose ${stack} because it let us move fast without sacrificing quality. Every feature — from ${features.split(',')[0]?.trim() || 'the core functionality'} to the polish — was driven by actual user feedback.\n\nHere's what I learned building ${name}:\n\n1. Start with the ugliest MVP possible\n2. Ship weekly, not monthly\n3. Your users know more than your product roadmap\n4. Technical debt is fine if you know where it lives\n5. Celebrate small wins — they compound\n\nThe tech industry has a habit of overcomplicating things. Sometimes the best solution is the simplest one.\n\nBuilding something right now? I'd love to hear about it. Drop a comment or send me a message 🚀`,

            `Everyone talks about the launch.\n\nNobody talks about the 47 failed deployments before it.\n\nWe just shipped ${name} and I want to be honest about the journey.\n\n${features.split(',')[0]?.trim() || 'The main feature'} took 3 complete rewrites. Our ${stack.split(',')[0]?.trim() || 'tech'} setup broke twice in production. We almost gave up in month 2.\n\nBut here we are.\n\nWhat kept us going was a simple question: "Would I use this myself?"\n\nEvery time the answer was "not yet," we went back to the drawing board.\n\nThe result? Something we're genuinely proud of. Not because it's perfect — it's far from it — but because it solves a real problem in a way that feels right.\n\nThree things I wish someone told me earlier:\n\n• Perfect is the enemy of shipped\n• Your first 10 users matter more than your next 10,000\n• Building alone is faster. Building with others is better.\n\nIf you're in the trenches right now, keep going. The breakthrough is closer than you think. 💪`
        ],
        hookSuggestions: [
            `"I almost deleted the entire codebase last Tuesday." — Start with a vulnerable moment`,
            `"What if I told you ${name} was built in just 3 months?" — Lead with an impressive stat`,
            `"Stop scrolling. This might change how you think about ${features.split(',')[0]?.trim() || 'technology'}." — Direct pattern interrupt`,
            `Share a specific failure moment that led to a breakthrough — authenticity hooks`
        ],
        hashtags: [
            '#buildinpublic',
            '#startup',
            `#${(input.projectName || 'project').replace(/\s+/g, '')}`,
            '#softwaredevelopment',
            '#techstartup',
            '#innovation',
            '#productdevelopment',
            '#entrepreneurship'
        ],
        ctaSuggestions: [
            `"What's a project you almost gave up on? I'd love to hear your story below 👇"`,
            `"Follow me for more behind-the-scenes of building ${name}. DMs are always open."`,
            `"Try ${name} yourself and let me know what you think — link in comments."`
        ],
        bestPostingTime: "Tuesday to Thursday, 8:00-10:00 AM your local time. LinkedIn engagement peaks mid-week mornings when professionals are starting their day."
    };
}

export async function generatePosts(input: PostGeneratorInput): Promise<PostGeneratorResult> {
    const userMessage = `Create 3 LinkedIn post variations for this project:

Project Name: ${input.projectName || "Personal Project"}
Tech Stack: ${input.techStack || "Not specified"}
Key Features: ${input.features || "Not specified"}
Purpose: ${input.purpose || "announcement"} - ${purposeGuidance[input.purpose] || purposeGuidance.announcement}
Tone: ${input.tone || "professional"} - ${toneGuidance[input.tone] || toneGuidance.professional}

Return a JSON object with:
- posts: Array of 3 different post variations (each 150-300 words)
- hookSuggestions: Array of 3-4 alternative hook ideas
- hashtags: Array of 5-8 relevant hashtags (include the # symbol)
- ctaSuggestions: Array of 3 call-to-action options
- bestPostingTime: Recommendation for best posting time

Each post should have a different angle or approach while maintaining the core message.`;

    const content = await callGemini(POST_GENERATOR_PROMPT, userMessage);
    if (content) {
        try { return JSON.parse(content); } catch { /* fall through to demo */ }
    }
    console.info('Using demo mode for post generation');
    return generateDemoPosts(input);
}

// ==================== POST ANALYZER ====================

const POST_ANALYZER_PROMPT = `You are a LinkedIn content analyst that helps improve posts for better engagement.

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

export interface PostAnalyzerResult {
    improvedVersion: string;
    engagementScore: number;
    hookImprovements: string[];
    formattingTips: string[];
    overallFeedback: string;
}

function generateDemoAnalysis(post: string): PostAnalyzerResult {
    const wordCount = post.split(/\s+/).length;
    const hasHook = /^["""]|^\?|^[A-Z].*\?/.test(post.trim());
    const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(post);
    const hasLineBreaks = (post.match(/\n\n/g) || []).length >= 2;

    let score = 5;
    if (hasHook) score += 1;
    if (hasEmoji) score += 0.5;
    if (hasLineBreaks) score += 1;
    if (wordCount > 100 && wordCount < 300) score += 1;
    if (wordCount < 50) score -= 1;
    score = Math.min(10, Math.max(1, Math.round(score)));

    const firstLine = post.split('\n')[0]?.substring(0, 80) || '';

    return {
        improvedVersion: `Here's what most people get wrong about this topic.\n\n${post.split('\n').slice(0, 3).join('\n')}\n\nThe key insight? It's not about doing more — it's about doing the right things consistently.\n\nThree takeaways:\n→ Start with the problem, not the solution\n→ Keep your message focused on one core idea\n→ End with a question that invites genuine conversation\n\nWhat's your experience with this? I'd love to hear different perspectives 👇`,
        engagementScore: score,
        hookImprovements: [
            `Your opening "${firstLine}..." could be stronger. Try starting with a bold statement or unexpected question`,
            `Consider leading with a specific number or statistic to grab attention immediately`,
            `Personal stories outperform generic openings 3:1 on LinkedIn — try "Last week I..." or "I used to think..."`,
            `Pattern interrupts work well — try "Stop." or "Unpopular opinion:" to break the scroll`
        ],
        formattingTips: [
            `${hasLineBreaks ? 'Good use of white space!' : 'Add more line breaks — LinkedIn rewards scannable content. Use single-line paragraphs.'}`,
            `${wordCount < 100 ? 'Your post is quite short. Aim for 150-250 words for optimal engagement.' : wordCount > 300 ? 'Consider trimming — posts over 300 words see diminishing engagement.' : 'Good length! 150-250 words hits the sweet spot.'}`,
            `Use → or • for list items instead of numbers — they're more visually appealing on LinkedIn`,
            `${hasEmoji ? 'Emoji usage looks good — just make sure they add meaning, not just decoration.' : 'Consider adding 1-2 strategic emojis to break up text and add visual interest.'}`
        ],
        overallFeedback: `This post has ${score >= 7 ? 'strong' : score >= 5 ? 'decent' : 'room for improvement in'} engagement potential. ${hasHook ? 'The hook is attention-grabbing.' : 'The opening could be more compelling to stop the scroll.'} ${hasLineBreaks ? 'The formatting makes it easy to scan.' : 'Better formatting with more white space would improve readability.'} Focus on adding a clear call-to-action at the end to boost comments.`
    };
}

export async function analyzePost(post: string): Promise<PostAnalyzerResult> {
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

    const content = await callGemini(POST_ANALYZER_PROMPT, userMessage);
    if (content) {
        try { return JSON.parse(content); } catch { /* fall through to demo */ }
    }
    console.info('Using demo mode for post analysis');
    return generateDemoAnalysis(post);
}

// ==================== PROFILE OPTIMIZER ====================

const PROFILE_OPTIMIZER_PROMPT = `You are a LinkedIn profile optimization expert focused on recruiter attraction, keyword optimization, and natural professional tone.

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

export interface ProfileOptimizerInput {
    headline: string;
    about: string;
    skills: string;
    experience: string;
}

export interface ProfileOptimizerResult {
    optimizedHeadline: string;
    optimizedAbout: string;
    suggestedSkills: string[];
    keywordSuggestions: string[];
    recruiterSummary: string;
}

function generateDemoProfileOptimization(input: ProfileOptimizerInput): ProfileOptimizerResult {
    const skills = input.skills?.split(',').map(s => s.trim()).filter(Boolean) || ['Software Development'];
    const primarySkill = skills[0] || 'Technology';

    return {
        optimizedHeadline: `${primarySkill} Expert | Building scalable solutions | ${input.experience || '5+ years'} driving measurable impact`,
        optimizedAbout: `I solve complex problems with elegant solutions.\n\nOver ${input.experience || 'several years'}, I've helped teams ship products that users actually love. My focus is on ${skills.slice(0, 3).join(', ')} — not just writing code, but building systems that scale.\n\nWhat I bring to the table:\n→ Deep expertise in ${primarySkill} with hands-on production experience\n→ Track record of delivering projects on time and within scope\n→ Strong communicator who bridges the gap between technical and business teams\n\nI believe the best technology is invisible — it just works. That philosophy drives everything I build.\n\nCurrently open to interesting challenges where I can make a real impact. If you're building something meaningful, let's talk.\n\n📩 Feel free to reach out — I respond to every message.`,
        suggestedSkills: [
            ...skills.slice(0, 3),
            'System Design',
            'Technical Leadership',
            'Agile Methodologies',
            'Cross-functional Collaboration',
            'Problem Solving'
        ].slice(0, 8),
        keywordSuggestions: [
            primarySkill,
            'Full Stack Development',
            'Software Architecture',
            'Cloud Infrastructure',
            'CI/CD',
            'Team Leadership',
            'Product Development',
            'Scalable Systems'
        ],
        recruiterSummary: `Results-driven ${primarySkill} professional with ${input.experience || 'extensive'} experience building scalable applications. Proven ability to lead cross-functional teams and deliver high-impact projects. Strong technical foundation combined with excellent communication skills makes them an ideal candidate for senior engineering and leadership roles.`
    };
}

export async function optimizeProfile(input: ProfileOptimizerInput): Promise<ProfileOptimizerResult> {
    const userMessage = `Please optimize this LinkedIn profile:

Current Headline: ${input.headline || "Not provided"}

Current About Section: ${input.about || "Not provided"}

Skills: ${input.skills || "Not provided"}

Experience: ${input.experience || "Not provided"}

Return a JSON object with these fields:
- optimizedHeadline: Improved headline (max 120 chars)
- optimizedAbout: Improved about section (max 2000 chars, use short paragraphs)
- suggestedSkills: Array of 5-8 relevant skills to add
- keywordSuggestions: Array of 5-8 industry keywords to incorporate
- recruiterSummary: A 2-3 sentence summary optimized for recruiters`;

    const content = await callGemini(PROFILE_OPTIMIZER_PROMPT, userMessage);
    if (content) {
        try { return JSON.parse(content); } catch { /* fall through to demo */ }
    }
    console.info('Using demo mode for profile optimization');
    return generateDemoProfileOptimization(input);
}
