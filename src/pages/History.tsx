import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, FileText, Search, Copy, Check, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HistoryItem {
  id: string;
  post_type: string;
  project_name: string | null;
  original_content: string | null;
  generated_content: string;
  hashtags: string[] | null;
  engagement_score: number | null;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;

      const { data, error } = await supabase
        .from('generated_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load history');
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }

    fetchHistory();
  }, [user]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('generated_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete item');
    } else {
      setItems(items.filter(item => item.id !== id));
      toast.success('Deleted successfully');
    }
  };

  const generatedPosts = items.filter(item => item.post_type === 'generated');
  const analyzedPosts = items.filter(item => item.post_type === 'analyzed');

  const HistoryCard = ({ item }: { item: HistoryItem }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            item.post_type === 'generated' ? 'bg-primary/10' : 'bg-accent/10'
          }`}>
            {item.post_type === 'generated' ? (
              <FileText className="w-5 h-5 text-primary" />
            ) : (
              <Search className="w-5 h-5 text-accent" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">
              {item.project_name || (item.post_type === 'generated' ? 'Generated Post' : 'Analyzed Post')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.engagement_score && (
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
              item.engagement_score >= 8 
                ? 'bg-green-500/10 text-green-500'
                : item.engagement_score >= 6
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
            }`}>
              Score: {item.engagement_score}/10
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-4 mb-4 whitespace-pre-wrap">
        {item.generated_content}
      </p>

      {item.hashtags && item.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {item.hashtags.slice(0, 5).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(item.generated_content, item.id)}
        >
          {copiedId === item.id ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteItem(item.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">History</h1>
              <p className="text-muted-foreground">
                View and manage your generated content
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="generated">Generated ({generatedPosts.length})</TabsTrigger>
            <TabsTrigger value="analyzed">Analyzed ({analyzedPosts.length})</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 shimmer rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No history yet</h2>
              <p className="text-muted-foreground mb-4">
                Start generating posts or analyzing content to see it here.
              </p>
            </motion.div>
          ) : (
            <>
              <TabsContent value="all" className="grid gap-4">
                {items.map((item) => (
                  <HistoryCard key={item.id} item={item} />
                ))}
              </TabsContent>

              <TabsContent value="generated" className="grid gap-4">
                {generatedPosts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No generated posts yet</p>
                ) : (
                  generatedPosts.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="analyzed" className="grid gap-4">
                {analyzedPosts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No analyzed posts yet</p>
                ) : (
                  analyzedPosts.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
