import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Copy, Check, Loader2, TrendingUp, MessageSquare, Layout } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { analyzePost } from '@/lib/ai-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalysisResult {
  improvedVersion: string;
  engagementScore: number;
  hookImprovements: string[];
  formattingTips: string[];
  overallFeedback: string;
}

export default function PostAutopsy() {
  const { user } = useAuth();
  const [originalPost, setOriginalPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!originalPost.trim()) {
      toast.error('Please paste a LinkedIn post to analyze');
      return;
    }

    setLoading(true);
    try {
      const data = await analyzePost(originalPost);

      setResult(data);

      // Save to database
      if (user) {
        await supabase.from('generated_posts').insert({
          user_id: user.id,
          post_type: 'analyzed',
          original_content: originalPost,
          generated_content: data.improvedVersion,
          engagement_score: data.engagementScore,
          hook_suggestions: data.hookImprovements,
          formatting_tips: data.formattingTips,
        });
      }

      toast.success('Post analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improvedVersion);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">PostAutopsy</h1>
              <p className="text-muted-foreground">
                Analyze and improve your LinkedIn posts
              </p>
            </div>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="post">Paste Your LinkedIn Post</Label>
            <Textarea
              id="post"
              placeholder="Paste your LinkedIn post here to get AI-powered feedback and improvements..."
              value={originalPost}
              onChange={(e) => setOriginalPost(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {originalPost.length} characters
            </p>
          </div>

          <Button
            variant="hero"
            className="w-full"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Post...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Post
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
            {/* Engagement Score */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Engagement Score</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on hook strength, readability, and engagement potential
                  </p>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(result.engagementScore)}`}>
                    {result.engagementScore}
                  </div>
                  <div className="text-sm text-muted-foreground">/10</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-4 h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.engagementScore * 10}%` }}
                  transition={{ duration: 1 }}
                  className={`h-full ${result.engagementScore >= 8
                      ? 'bg-green-500'
                      : result.engagementScore >= 6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                />
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-lg mb-3">Overall Feedback</h3>
              <p className="text-muted-foreground">{result.overallFeedback}</p>
            </div>

            {/* Improved Version */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Improved Version</h3>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </Button>
              </div>
              <p className="whitespace-pre-wrap text-sm bg-secondary/50 p-4 rounded-lg">
                {result.improvedVersion}
              </p>
            </div>

            {/* Improvements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hook Improvements */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Hook Improvements</h3>
                </div>
                <ul className="space-y-3">
                  {result.hookImprovements.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formatting Tips */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Formatting Tips</h3>
                </div>
                <ul className="space-y-3">
                  {result.formattingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
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
