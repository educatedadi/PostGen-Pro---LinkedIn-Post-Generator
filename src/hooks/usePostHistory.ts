import { useState, useEffect } from "react";

export interface SavedPost {
  id: string;
  content: string;
  imagePrompt: string;
  topic: string;
  tone?: string;
  savedAt: string;
}

const STORAGE_KEY = "linkedin-post-history";

export const usePostHistory = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedPosts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved posts:", e);
      }
    }
  }, []);

  const savePost = (post: Omit<SavedPost, "id" | "savedAt">) => {
    const newPost: SavedPost = {
      ...post,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    const updated = [newPost, ...savedPosts];
    setSavedPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removePost = (id: string) => {
    const updated = savedPosts.filter((p) => p.id !== id);
    setSavedPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSavedPosts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { savedPosts, savePost, removePost, clearHistory };
};
