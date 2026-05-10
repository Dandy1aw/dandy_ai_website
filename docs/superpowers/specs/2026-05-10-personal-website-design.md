# Personal Website Design Spec
Date: 2026-05-10

## Overview

An Apple-like personal site for a software engineer focused on AI, recommendation systems, and product engineering. The site records technical practice, AI observations, and personal building process — not a portfolio or blog, but a long-form sharing destination with a strong personal voice.

**Positioning:** AI Builder Notes — 一个关注 AI、推荐系统和产品工程的程序员，记录技术实践、AI 观察和个人构建过程。

**Design language:** Apple-inspired — light background, high whitespace, large headlines, quality-first. Not dark/neon "tech aesthetic." One focus per section.

**Content style:** Chinese/English natural mix, no language switcher. Writing style matches the design doc's voice.

---

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Astro 5 | Built for content sites; zero-JS by default |
| Styling | Tailwind CSS v4 | Via Vite plugin (`@tailwindcss/vite`), **not** `@astrojs/tailwind` |
| MDX | `@astrojs/mdx` | Astro official integration; enables MDX in Content Collections |
| Content | MDX + Astro Content Collections | Schema defined in `src/content.config.ts` |
| Animation | CSS transitions + Intersection Observer | Zero dependencies; covers 95% of use cases |
| Icons | Lucide Icons | Clean, consistent |
| Deployment | Vercel (SSG) | Static output, free tier, instant deploys |

**Tailwind v4 integration note:** Add `@tailwindcss/vite` as a Vite plugin in `astro.config.ts`. Do not use the legacy `@astrojs/tailwind` adapter — it does not support Tailwind v4.

---

## Architecture

### Approach: Layered (分层式)

All content queries go through a single `lib/content.ts` abstraction layer. Pages never call Astro Content Collections directly. This makes future CMS migration a single-file change.

Components are split into two layers:
- `ui/` — primitive atoms (Button, Tag, NoteCard, Navbar, Footer)
- `sections/` — page-level blocks (Hero, FocusCards, FeaturedNotes, Belief, NotesList)

### Directory Structure

```
src/
  pages/
    index.astro           # Route: /
    notes/
      index.astro         # Route: /notes
      [slug].astro        # Route: /notes/[slug]
    about.astro           # Route: /about
  components/
    ui/
      Button.astro
      Tag.astro
      NoteCard.astro
      Navbar.astro
      Footer.astro
    sections/
      Hero.astro
      FocusCards.astro
      FeaturedNotes.astro
      Belief.astro
      NotesList.astro
  content/
    notes/                # .mdx article files live here
  content.config.ts       # Astro Content Collections schema ★
  lib/
    content.ts            # Single content query entry point ★
    utils.ts              # Shared utilities (date formatting, reading time)
  scripts/
    reveal.ts             # Intersection Observer for scroll animations
  layouts/
    Base.astro            # Global layout: Navbar + Footer
    Post.astro            # Article layout: narrow width + prose styles
  styles/
    global.css            # Global styles + animation classes
```

### Data Flow

```
MDX files → content.config.ts (schema) → Content Collections → lib/content.ts → Pages/Sections → HTML (SSG)
```

---

## MVP Scope

**3 core modules, 4 route types.**

| Module | Routes | Status |
|---|---|---|
| Home | `/` | MVP |
| Notes | `/notes`, `/notes/[slug]` | MVP |
| About | `/about` | MVP |
| Projects | `/projects` | Phase 2 |

---

## Pages

### 1. Homepage (`/`)

Five sections, one focus each:

| # | Section | Component | Description |
|---|---|---|---|
| 1 | Hero | `Hero.astro` | Identity + one-line bio + two CTAs: 「读 AI Notes」→ `/notes`, 「关于我」→ `/about`. "查看 Projects" deferred to Phase 2. |
| 2 | Focus Areas | `FocusCards.astro` | 3 cards: AI Tools · Recommendation · Product Engineering |
| 3 | Featured Notes | `FeaturedNotes.astro` | 2 featured articles, side-by-side cards. See fallback rules below. |
| 4 | Belief | `Belief.astro` | Dark background, one personal statement |
| 5 | Footer | `Footer.astro` | Copyright + social links (Email · GitHub · LinkedIn · X) |

Hero copy:
```
程序员。
AI 实践者。
产品构建者。

分享 AI 工具实践、推荐系统分析、产品工程经验，
以及一些自己构建的小项目。
```

**FeaturedNotes fallback rules:**
1. Query all articles where `featured: true`, sorted by date desc.
2. If fewer than 2 results, fill remaining slots from most recent non-featured articles (excluding drafts).
3. If 0 articles total, hide the section entirely.

### 2. Notes List (`/notes`)

- Page header: "AI Notes" title + one-line description
- Tag filter bar: `[All]` `[AI Tools]` `[Recommendation]` `[Product Engineering]` `[Thinking]`
- Article list format per row: Title / One-line summary / Date · Tag · Reading time
- Draft articles (`draft: true`) are never rendered
- **Tag filter state persisted in URL query param:** selecting a tag updates the URL to `/notes?tag=ai-tools`. On page load, read `?tag` param to restore filter state. This makes filtered views bookmarkable and shareable.
- No pagination in MVP

### 3. Article Detail (`/notes/[slug]`)

- Draft articles return 404 (excluded from `getStaticPaths`)
- Back link: `← AI Notes`
- Tag badge + title (32px, letter-spacing tight) + date + reading time
- If `updatedDate` exists and differs from `date`, show "Updated YYYY-MM-DD" below the date
- Prose body: max-width 680px centered, font-size 17px, line-height 1.8
- Code blocks: JetBrains Mono, light gray background, rounded corners
- Bottom: "继续阅读" — 1 related article card (same tag, different slug)
  - Fallback 1: if no same-tag article, show most recent article (any tag)
  - Fallback 2: if only 1 article total, hide the section
- No comments system

### 4. About (`/about`)

- Avatar (photo or abstract placeholder)
- Greeting + bio:
  ```
  你好，我是 XXX。
  一名关注 AI、推荐系统与产品工程的程序员。
  我在这里记录 AI 工具实践、技术分析、产品思考和个人构建过程。
  ```
- Focus list:
  - AI Tools & Workflow
  - Recommendation Systems
  - Product Engineering
  - Personal Knowledge & Writing
- Contact: Email · GitHub · LinkedIn · X

---

## Content Schema

### src/content.config.ts

Defines the Content Collections schema. All field types enforced at build time.

```ts
import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tag: z.enum(['AI Tools', 'Recommendation', 'Product Engineering', 'Thinking']),
    readingTime: z.number(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
```

### MDX Frontmatter

```yaml
---
title: "AI 如何改变程序员的工作流"
description: "从代码生成、数据分析到产品设计，我如何把 AI 融入日常工作。"
date: 2026-05-01
updatedDate: 2026-05-08   # optional — show "Updated" label if present and different from date
tag: "AI Tools"           # "AI Tools" | "Recommendation" | "Product Engineering" | "Thinking"
readingTime: 6            # minutes, set manually
featured: true            # appears in homepage FeaturedNotes
draft: false              # true = excluded from build output and getStaticPaths
---
```

### lib/content.ts API

```ts
getNotes(): Note[]                  // All non-draft articles, sorted by date desc
getFeaturedNotes(): Note[]          // featured === true, non-draft, sorted by date desc
getNotesByTag(tag: string): Note[]  // non-draft, filtered by tag
getNoteBySlug(slug: string): Note   // single article (used by detail page)
getRelatedNote(current: Note): Note | null  // same tag, different slug; falls back to most recent
```

All pages import from `lib/content.ts` only. Never import directly from Astro's `getCollection`.

---

## Animation System

Zero dependencies. Three pieces:

**1. CSS classes (`styles/global.css`)**

```css
/* Default: hidden + shifted */
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

/* JS adds this class when element enters viewport */
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Respect user motion preference */
@media (prefers-reduced-motion: reduce) {
  .fade-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

**JS failure fallback:** Elements with `.fade-up` start invisible. If JS fails to load, users see blank content. To prevent this, `scripts/reveal.ts` must add a `js-loaded` class to `<html>` on execution. CSS only hides `.fade-up` when `.js-loaded` is present:

```css
/* Only hide when JS is confirmed loaded */
.js-loaded .fade-up {
  opacity: 0;
  transform: translateY(20px);
}
.js-loaded .fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**2. Intersection Observer (`scripts/reveal.ts`)**
- On load: adds `js-loaded` to `<html>`
- Observes all `.fade-up` elements
- Adds `.visible` when element enters viewport (threshold: 0.1)
- Section staggering via `transition-delay` on sibling elements

**3. Usage**

Add `class="fade-up"` to any element. For staggered children, add `style="transition-delay: Xms"` per item.

---

## SEO Metadata

Each page sets its own `<title>`, `<meta name="description">`, and Open Graph tags via a `<SEO>` component (or inline in `Base.astro`).

| Page | `<title>` | `<meta description>` |
|---|---|---|
| `/` | `YourName — AI Builder Notes` | Use site tagline |
| `/notes` | `AI Notes — YourName` | "关于 AI、推荐系统和产品工程的实践记录" |
| `/notes/[slug]` | `{article.title} — YourName` | `article.description` |
| `/about` | `About — YourName` | First sentence of bio |

**Rules:**
- All pages include `<meta name="description">` with content from frontmatter or hardcoded per page.
- All pages include Open Graph tags: `og:title`, `og:description`, `og:type` (`website` for static pages, `article` for notes).
- Article pages include `og:article:published_time` and `og:article:modified_time` (if `updatedDate` present).
- No auto-generated OG images in MVP — use a single static default OG image.

---

## Design Tokens (Tailwind v4)

Defined via CSS custom properties in `global.css` and referenced in Tailwind config:

```css
@theme {
  --color-bg: #F5F5F7;
  --color-bg-dark: #000000;
  --color-text: #1D1D1F;
  --color-muted: #6E6E73;
  --color-card: #FFFFFF;
  --color-accent: #0071E3;
  --color-border: #D2D2D7;

  --font-sans: Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}
```

---

## Navigation

Fixed top navbar, `backdrop-blur`, no explicit border:

```
YourName        AI Notes    About
```

Active page link: `color: #0071E3`. No hamburger menu in MVP (3 nav items fits all screens).

---

## Phase 2 (Out of Scope for MVP)

- Projects page (`/projects`) — large project cards with tech stack tags
- Search / full-text filtering
- RSS feed
- Auto-generated OG images
- CMS migration (`lib/content.ts` abstraction makes this a single-file change)

---

## Launch Checklist (MVP)

- [ ] Astro project scaffolded with `@astrojs/mdx` + `@tailwindcss/vite`
- [ ] `src/content.config.ts` schema defined
- [ ] `lib/content.ts` abstraction layer implemented
- [ ] 3 pages built (Home, Notes list + detail, About)
- [ ] `scripts/reveal.ts` scroll animation with `prefers-reduced-motion` + JS fallback
- [ ] SEO metadata on all pages
- [ ] 3 seed articles written (why this site / AI workflow / one recsys analysis)
- [ ] Responsive (mobile + desktop)
- [ ] Vercel deployment configured
- [ ] `.superpowers/` added to `.gitignore`
