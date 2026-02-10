# PostGen Pro

An AI‑powered LinkedIn post generator focused on speed, polish, and thoughtful UX. Built to feel like a product, not a demo.

![PostGen Pro UI](https://github.com/user-attachments/assets/3675a817-a73d-43be-bd24-9f3cad710acc)

## Features
- **Gemini‑powered post generation** with structured prompts for tone, hooks, formatting, and hashtags.
- **Google sign‑in via Supabase** to unlock unlimited generations for authenticated users.
- **Usage gating** for anonymous sessions with a clear upgrade path.
- **History & saved posts** with local persistence for quick reuse.
- **Crisp, mobile‑first UI** built with shadcn/ui and Tailwind.
- **Resilient error handling** for rate limits and AI credit exhaustion.

[![Feature Strip Placeholder](https://img.shields.io/badge/Feature%20Strip-Placeholder-0F172A?style=for-the-badge&logo=vercel&logoColor=white)](#)

## Product Walkthrough
1. **Compose**: Choose a topic and tone for your LinkedIn post.
2. **Generate**: Get a long‑form post with emojis, hashtags, and a matching image prompt.
3. **Save**: Store posts locally and revisit in History or Saved.
4. **Sign in**: Authenticate via Google to remove usage limits.

![Product Walkthrough](https://github.com/user-attachments/assets/6b7c6fcf-f977-4c43-9f86-9be56825e087)

## Technical Highlights
- **Prompt architecture**: A structured system prompt enforces output format and length targets while preserving tone.
- **Client‑side resilience**: Robust parsing of AI JSON output with graceful fallbacks.
- **Usage analytics**: Lightweight local tracking paired with authenticated upgrades.
- **Supabase auth integration**: Clean auth hooks and session syncing.
- **Modular UI**: Components organized for reusability and incremental feature growth.

```text
User -> React UI
     -> Gemini API (content generation)
     -> Supabase Auth (Google OAuth)
         -> Session state + gating
Local Storage
  -> History + Saved posts
```

## Stack
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: Supabase Auth (Google OAuth)
- **AI**: Gemini API

[![Vite](https://img.shields.io/badge/Vite-Placeholder-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-Placeholder-61DAFB?style=for-the-badge&logo=react&logoColor=000)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Placeholder-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Placeholder-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Placeholder-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-Placeholder-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

## Screens
- Home / Create
- History
- Saved
- Settings & Auth

[Placeholder: 4‑up screen grid]

## Notes
This repo emphasizes product‑grade UX, clean component architecture, and a pragmatic path from anonymous usage to authenticated engagement.
