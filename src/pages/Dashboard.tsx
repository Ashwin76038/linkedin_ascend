import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  Search,
  User,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  full_name: string | null;
  headline: string | null;
  profile_strength_score: number;
}

interface GeneratedPost {
  id: string;
  project_name: string | null;
  created_at: string;
  post_type: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentPosts, setRecentPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, headline, profile_strength_score')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch recent posts
      const { data: postsData } = await supabase
        .from('generated_posts')
        .select('id, project_name, created_at, post_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsData) {
        setRecentPosts(postsData);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  const quickActions = [
    {
      icon: User,
      title: "Optimize Profile",
      description: "Improve your headline and about section",
      path: "/profile-optimizer",
      gradient: "from-primary to-accent",
    },
    {
      icon: FileText,
      title: "Generate Post",
      description: "Create engaging LinkedIn content",
      path: "/post-generator",
      gradient: "from-accent to-primary",
    },
    {
      icon: Search,
      title: "Analyze Post",
      description: "Get feedback on existing posts",
      path: "/post-autopsy",
      gradient: "from-primary to-accent",
    },
  ];

  const suggestions = [
    {
      icon: Target,
      text: "Add keywords like 'AI', 'Machine Learning' to your headline",
      priority: "high",
    },
    {
      icon: Zap,
      text: "Your about section could be more action-oriented",
      priority: "medium",
    },
    {
      icon: Clock,
      text: "Best time to post: Tuesdays and Wednesdays 8-10 AM",
      priority: "low",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">{profile?.full_name || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your LinkedIn growth journey
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Profile Strength */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profile Strength</p>
                <p className="text-4xl font-bold gradient-text">
                  {loading ? '--' : profile?.profile_strength_score || 0}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profile?.profile_strength_score || 0}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-primary"
                />
              </div>
            </div>
          </div>

          {/* Posts Generated */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Posts Generated</p>
                <p className="text-4xl font-bold">
                  {loading ? '--' : recentPosts.filter(p => p.post_type === 'generated').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This week
            </p>
          </div>

          {/* Posts Analyzed */}
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Posts Analyzed</p>
                <p className="text-4xl font-bold">
                  {loading ? '--' : recentPosts.filter(p => p.post_type === 'analyzed').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              This week
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card p-6 cursor-pointer group hover-glow"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                  <ArrowRight className="w-4 h-4 mt-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Link to="/history">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 shimmer rounded-lg" />
                ))}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.slice(0, 4).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {post.post_type === 'generated' ? (
                        <FileText className="w-5 h-5 text-primary" />
                      ) : (
                        <Search className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {post.project_name || (post.post_type === 'generated' ? 'Generated Post' : 'Analyzed Post')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      post.post_type === 'generated' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {post.post_type === 'generated' ? 'Generated' : 'Analyzed'}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No activity yet</p>
                <Link to="/post-generator">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Create your first post
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Optimization Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Optimization Tips</h2>
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    suggestion.priority === 'high' 
                      ? 'bg-destructive/10 text-destructive'
                      : suggestion.priority === 'medium'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <suggestion.icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm">{suggestion.text}</p>
                </motion.div>
              ))}
            </div>
            <Link to="/profile-optimizer">
              <Button variant="ghost" className="w-full mt-4">
                Optimize Your Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
