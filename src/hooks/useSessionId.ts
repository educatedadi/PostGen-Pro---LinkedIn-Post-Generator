import { useState, useEffect } from "react";

const SESSION_ID_KEY = "linkedin-generator-session-id";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    let storedSessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  return sessionId;
}
