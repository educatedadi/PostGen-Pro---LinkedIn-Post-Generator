import { useState, useEffect } from "react";
import { toast } from "sonner";
import AppHeader from "@/components/layout/AppHeader";
import BottomNav, { type TabType } from "@/components/layout/BottomNav";
import SettingsDrawer from "@/components/layout/SettingsDrawer";
import CreateTab from "@/components/create/CreateTab";
import HistoryTab from "@/components/history/HistoryTab";
import SavedTab from "@/components/saved/SavedTab";
import GeneratedPostCard from "@/components/GeneratedPostCard";
import UpgradeModal from "@/components/UpgradeModal";
import { usePostHistory } from "@/hooks/usePostHistory";
import { useAuth } from "@/hooks/useAuth";
import { useSessionId } from "@/hooks/useSessionId";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import type { ToneType } from "@/components/create/ToneSelector";

interface GeneratedPost {
  content: string;
  imagePrompt: string;
}

interface HistoryPost {
  id: string;
  topic: string;
  content: string;
  tone: string;
  createdAt: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentTone, setCurrentTone] = useState<ToneType>("professional");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [historyPosts, setHistoryPosts] = useState<HistoryPost[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { savedPosts, savePost, removePost } = usePostHistory();
  const { user, signInWithGoogle, signOut } = useAuth();
  const sessionId = useSessionId();
  const { usage, updateUsage, canGenerate, maxFreeGenerations } = useUsageTracking(!!user);

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("linkedin-generator-history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistoryPosts(parsed.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })));
      } catch {
        // Invalid data
      }
    }
  }, []);

  const addToHistory = (topic: string, content: string, tone: ToneType) => {
    const newPost: HistoryPost = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      topic,
      content,
      tone,
      createdAt: new Date(),
    };
    const updated = [newPost, ...historyPosts];
    setHistoryPosts(updated);
    localStorage.setItem("linkedin-generator-history", JSON.stringify(updated));
  };

  const handleGenerate = async (topic: string, tone: ToneType) => {
    if (!canGenerate) {
      setShowUpgradeModal(true);
      return;
    }

    setIsLoading(true);
    setGeneratedPost(null);
    setCurrentTopic(topic);
    setCurrentTone(tone);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY in .env");
      }

      const toneInstructions: Record<string, string> = {
        professional:
          "Use a professional, authoritative tone. Focus on insights, data, and expertise.",
        inspirational:
          "Use an inspiring, motivational tone. Include personal stories and uplifting messages.",
        humorous:
          "Use a light, witty tone with clever observations. Keep it professional but entertaining.",
        educational:
          "Use an informative, teaching tone. Break down concepts and provide actionable tips.",
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
            "x-goog-api-key": apiKey,
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
                    text: `Generate a ${tone} LinkedIn post about: "${topic}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
          return;
        }
        if (response.status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
          return;
        }
        const errorData = await response.text();
        throw new Error(errorData || "Failed to generate post");
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error("No content received from Gemini");
      }

      let post: GeneratedPost | null = null;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          post = parsed.post || parsed;
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", content);
        throw new Error("Failed to parse Gemini response");
      }

      if (!post?.content) {
        throw new Error("Invalid response format");
      }

      setGeneratedPost(post);
      addToHistory(topic, post.content, tone);

      const newCount = (usage?.generationCount ?? 0) + 1;
      updateUsage({
        generationCount: newCount,
        remaining: Math.max(0, maxFreeGenerations - newCount),
        isAuthenticated: !!user,
      });

      const remainingText = user ? "" : ` (${Math.max(0, maxFreeGenerations - newCount)} free left)`;
      toast.success(`Post generated!${remainingText}`);
    } catch (error) {
      console.error("Error generating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePost = () => {
    if (generatedPost) {
      savePost({
        content: generatedPost.content,
        imagePrompt: generatedPost.imagePrompt,
        topic: currentTopic,
        tone: currentTone,
      });
      toast.success("Post saved to library!");
    }
  };

  const isPostSaved = generatedPost
    ? savedPosts.some((saved) => saved.content === generatedPost.content)
    : false;

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "create":
      return "PostGen Pro";
      case "history":
        return "History";
      case "saved":
        return "Saved Posts";
    }
  };

  // Transform saved posts for SavedTab
  const transformedSavedPosts = savedPosts.map((post) => ({
    id: post.id,
    topic: post.topic,
    content: post.content,
    tone: post.tone,
    savedAt: new Date(post.savedAt),
  }));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={getHeaderTitle()} onRightAction={() => setSettingsOpen(true)} />

      <SettingsDrawer
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
      />

      <main>
        {activeTab === "create" && (
          <>
            <CreateTab
              onGenerate={handleGenerate}
              isLoading={isLoading}
              disabled={!canGenerate}
              disabledReason={!canGenerate ? "Sign in for unlimited access" : undefined}
              onOpenSettings={() => setSettingsOpen(true)}
            />

            {generatedPost && (
              <div className="max-w-md mx-auto w-full px-4 -mt-20 mb-24">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium text-muted-foreground px-4">
                    Your Generated Post
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <GeneratedPostCard
                  content={generatedPost.content}
                  imagePrompt={generatedPost.imagePrompt}
                  onSave={handleSavePost}
                  isSaved={isPostSaved}
                />
              </div>
            )}
          </>
        )}

        {activeTab === "history" && <HistoryTab posts={historyPosts} />}

        {activeTab === "saved" && (
          <SavedTab posts={transformedSavedPosts} onRemove={removePost} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        onSignIn={signInWithGoogle}
        generationsUsed={maxFreeGenerations}
      />
    </div>
  );
};

export default Index;
