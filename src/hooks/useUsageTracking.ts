import { useState, useEffect, useCallback } from "react";

const USAGE_KEY = "linkedin-generator-usage";
const MAX_FREE_GENERATIONS = 3;

interface UsageData {
  generationCount: number;
  remaining: number;
  isAuthenticated: boolean;
}

export function useUsageTracking(isAuthenticated: boolean) {
  const [usage, setUsage] = useState<UsageData>({
    generationCount: 0,
    remaining: MAX_FREE_GENERATIONS,
    isAuthenticated: false,
  });

  // Load initial usage from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(USAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUsage({
          ...parsed,
          isAuthenticated,
          remaining: isAuthenticated ? Infinity : Math.max(0, MAX_FREE_GENERATIONS - parsed.generationCount),
        });
      } catch {
        // Invalid stored data, reset
        localStorage.removeItem(USAGE_KEY);
      }
    }
  }, [isAuthenticated]);

  // Update usage after successful generation
  const updateUsage = useCallback((serverUsage: UsageData) => {
    const newUsage = {
      ...serverUsage,
      isAuthenticated,
      remaining: isAuthenticated ? Infinity : serverUsage.remaining,
    };
    setUsage(newUsage);
    localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
  }, [isAuthenticated]);

  // Check if user can generate (for UI purposes)
  const canGenerate = isAuthenticated || usage.remaining > 0;

  return {
    usage,
    updateUsage,
    canGenerate,
    maxFreeGenerations: MAX_FREE_GENERATIONS,
  };
}
