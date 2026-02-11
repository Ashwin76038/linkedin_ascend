import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Copy, Check, Loader2, Hash, Clock, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { generatePosts } from '@/lib/ai-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostResult {
  posts: string[];
  hookSuggestions: string[];
  hashtags: string[];
  ctaSuggestions: string[];
  bestPostingTime: string;
}

const presets = [
  { name: 'Civic AI Project', projectName: 'Civic AI', techStack: 'React, Python, OpenAI, FastAPI', features: 'AI-powered citizen engagement platform for local government', purpose: 'announcement' },
];

export default function PostGenerator() {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [techStack, setTechStack] = useState('');
  const [features, setFeatures] = useState('');
  const [purpose, setPurpose] = useState('announcement');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostResult | null>(null);
  const [copiedPost, setCopiedPost] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!projectName && !features) {
      toast.error('Please enter project name or features');
      return;
    }

    setLoading(true);
    try {
      const data = await generatePosts({
        projectName,
        techStack,
        features,
        purpose,
        tone,
      });

      setResult(data);

      // Save to database
      if (user) {
        await supabase.from('generated_posts').insert({
          user_id: user.id,
          post_type: 'generated',
          project_name: projectName,
          tech_stack: techStack,
          features,
          purpose,
          tone,
          generated_content: data.posts[0],
          hook_suggestions: data.hookSuggestions,
          hashtags: data.hashtags,
          cta_suggestions: data.ctaSuggestions,
          best_posting_time: data.bestPostingTime,
        });
      }

      toast.success('Posts generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedPost(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedPost(null), 2000);
  };

  const loadPreset = (preset: typeof presets[0]) => {
    setProjectName(preset.projectName);
    setTechStack(preset.techStack);
    setFeatures(preset.features);
    setPurpose(preset.purpose);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Post Generator</h1>
              <p className="text-muted-foreground">
                Create human-like LinkedIn posts that engage
              </p>
            </div>
          </div>
        </motion.div>

        {/* Presets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 flex-wrap"
        >
          <span className="text-sm text-muted-foreground self-center mr-2">Quick presets:</span>
          {presets.map((preset, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => loadPreset(preset)}
            >
              {preset.name}
            </Button>
          ))}
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Civic AI"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack</Label>
              <Input
                id="techStack"
                placeholder="e.g., React, Python, OpenAI"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Key Features / Description</Label>
            <Textarea
              id="features"
              placeholder="Describe what makes your project special..."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Project Announcement</SelectItem>
                  <SelectItem value="job_search">Job Search</SelectItem>
                  <SelectItem value="personal_brand">Personal Brand</SelectItem>
                  <SelectItem value="thought_leadership">Thought Leadership</SelectItem>
                  <SelectItem value="milestone">Milestone / Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="hero"
            className="w-full"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating 3 Variations...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Posts
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Post Variations */}
            <h2 className="text-xl font-semibold">Generated Posts</h2>
            <div className="space-y-4">
              {result.posts.map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Variation {i + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(post, i)}
                    >
                      {copiedPost === i ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{post}</p>
                </motion.div>
              ))}
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Hook Suggestions */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Hook Suggestions</h3>
                </div>
                <ul className="space-y-2">
                  {result.hookSuggestions.map((hook, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {hook}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hashtags */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Hashtags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                        toast.success('Hashtag copied!');
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA & Timing */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Best Timing</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {result.bestPostingTime}
                </p>
                <h4 className="font-medium text-sm mb-2">CTA Suggestions:</h4>
                <ul className="space-y-1">
                  {result.ctaSuggestions.map((cta, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {cta}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
