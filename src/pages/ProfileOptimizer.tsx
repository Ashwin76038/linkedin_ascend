import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { optimizeProfile } from '@/lib/ai-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OptimizationResult {
  optimizedHeadline: string;
  optimizedAbout: string;
  suggestedSkills: string[];
  keywordSuggestions: string[];
  recruiterSummary: string;
}

export default function ProfileOptimizer() {
  const { user } = useAuth();
  const [headline, setHeadline] = useState('');
  const [about, setAbout] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!headline && !about) {
      toast.error('Please enter at least your headline or about section');
      return;
    }

    setLoading(true);
    try {
      const data = await optimizeProfile({
        headline,
        about,
        skills,
        experience,
      });

      setResult(data);

      // Save to database
      if (user) {
        await supabase.from('profile_optimizations').insert({
          user_id: user.id,
          original_headline: headline,
          optimized_headline: data.optimizedHeadline,
          original_about: about,
          optimized_about: data.optimizedAbout,
          suggested_skills: data.suggestedSkills,
          keyword_suggestions: data.keywordSuggestions,
          recruiter_summary: data.recruiterSummary,
        });
      }

      toast.success('Profile optimized successfully!');
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Failed to optimize profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
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
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile Optimizer</h1>
              <p className="text-muted-foreground">
                AI-powered profile optimization for recruiters
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
            <Label htmlFor="headline">Current Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Software Engineer at Tech Corp"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About Section</Label>
            <Textarea
              id="about"
              placeholder="Paste your current about section here..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Key Skills (comma separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, React, Machine Learning"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                placeholder="e.g., 5 years in software development"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>

          <Button
            variant="hero"
            className="w-full"
            onClick={handleOptimize}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Optimize My Profile
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
            {/* Optimized Headline */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Optimized Headline</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.optimizedHeadline, 'headline')}
                >
                  {copiedField === 'headline' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-lg gradient-text font-medium">
                {result.optimizedHeadline}
              </p>
            </div>

            {/* Optimized About */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Optimized About Section</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.optimizedAbout, 'about')}
                >
                  {copiedField === 'about' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {result.optimizedAbout}
              </p>
            </div>

            {/* Recruiter Summary */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Recruiter-Focused Summary</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(result.recruiterSummary, 'summary')}
                >
                  {copiedField === 'summary' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground">
                {result.recruiterSummary}
              </p>
            </div>

            {/* Skills & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-lg mb-3">Suggested Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold text-lg mb-3">Keyword Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keywordSuggestions.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
