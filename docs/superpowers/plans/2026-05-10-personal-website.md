# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Apple-like personal site (3 pages: Home, Notes, About) with Astro 5, Tailwind v4, MDX Content Collections, and a migratable content abstraction layer.

**Architecture:** Layered — all content queries go through `src/lib/content.ts` (never direct `getCollection` calls in pages). Components split into `ui/` atoms and `sections/` page-blocks. Scroll animations via CSS + Intersection Observer with `prefers-reduced-motion` and JS-failure fallback.

**Tech Stack:** Astro 5, `@astrojs/mdx`, Tailwind CSS v4 (`@tailwindcss/vite` Vite plugin), Lucide Icons, Vercel (SSG)

---

## File Map

| File | Responsibility |
|---|---|
| `astro.config.ts` | Astro config: MDX integration + Tailwind Vite plugin |
| `src/content.config.ts` | Content Collections Zod schema for `notes` |
| `src/lib/content.ts` | All content queries (getNotes, getFeaturedNotes, etc.) |
| `src/lib/utils.ts` | `formatDate()` helper |
| `src/scripts/reveal.ts` | Intersection Observer scroll reveal |
| `src/styles/global.css` | `@theme` tokens + animation CSS |
| `src/layouts/Base.astro` | Navbar + Footer wrapper, injects reveal script |
| `src/layouts/Post.astro` | Article prose layout (680px max-width) |
| `src/components/ui/Navbar.astro` | Top nav with active-link detection |
| `src/components/ui/Footer.astro` | Social links row |
| `src/components/ui/Button.astro` | Primary / outline CTA button |
| `src/components/ui/Tag.astro` | Tag badge |
| `src/components/ui/NoteCard.astro` | Article card (list + featured use) |
| `src/components/sections/Hero.astro` | Homepage: identity + CTAs |
| `src/components/sections/FocusCards.astro` | Homepage: 3 focus area cards |
| `src/components/sections/FeaturedNotes.astro` | Homepage: 2 featured article cards |
| `src/components/sections/Belief.astro` | Homepage: dark belief block |
| `src/components/sections/NotesList.astro` | Notes list: tag filter bar + article rows |
| `src/pages/index.astro` | Homepage (assembles sections) |
| `src/pages/notes/index.astro` | Notes list page |
| `src/pages/notes/[slug].astro` | Article detail page |
| `src/pages/about.astro` | About page |
| `src/content/notes/*.mdx` | 3 seed articles |

---

## Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `astro.config.ts`
- Create: `tsconfig.json`

- [ ] **Step 1: Create project directory and initialise git**

```bash
cd D:/claudeCode/20260510_personal_website
git init
```

- [ ] **Step 2: Scaffold Astro project**

```bash
npm create astro@latest . -- --template minimal --typescript strictest --no-install --no-git
```

Accept all prompts. Choose TypeScript: `strict`.

- [ ] **Step 3: Install dependencies**

```bash
npm install
npm install @astrojs/mdx lucide-astro
npm install -D @tailwindcss/vite tailwindcss
```

- [ ] **Step 4: Write `astro.config.ts`**

```ts
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 5: Verify scaffold builds**

```bash
npx astro check && npx astro build
```

Expected: `Build complete` with no TypeScript errors.

- [ ] **Step 6: Create `.gitignore` additions**

Add to `.gitignore`:
```
dist/
.astro/
node_modules/
.superpowers/
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold Astro 5 project with MDX and Tailwind v4"
```

---

## Task 2: Design System

**Files:**
- Create: `src/styles/global.css`
- Create: `src/scripts/reveal.ts`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
@import "tailwindcss";

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

html {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

/* Scroll reveal — only active when JS loaded */
.js-loaded .fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.js-loaded .fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .js-loaded .fade-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Create `src/scripts/reveal.ts`**

```ts
document.documentElement.classList.add('js-loaded');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        observer.unobserve(target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css src/scripts/reveal.ts
git commit -m "feat: add design tokens and scroll reveal animation system"
```

---

## Task 3: Content Schema and Seed Articles

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/notes/why-this-site.mdx`
- Create: `src/content/notes/ai-workflow.mdx`
- Create: `src/content/notes/recsys-tuning.mdx`

- [ ] **Step 1: Create `src/content.config.ts`**

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

- [ ] **Step 2: Create `src/content/notes/why-this-site.mdx`**

```mdx
---
title: "为什么我开始写这个个人网站"
description: "关于记录、分享和个人品牌的一些思考。"
date: 2026-04-15
tag: "Thinking"
readingTime: 5
featured: false
draft: false
---

## 起点

做这个网站的念头来得很自然。

作为一个持续关注 AI、推荐系统和产品工程的程序员，我有很多想法散落在各处——笔记、对话、代码注释。写作让这些想法变得真实，也让它们有机会对别人产生价值。

## 为什么不用现成平台

Medium、知乎、掘金都试过。问题不在于流量，在于**所有权**和**形式自由**。

在自己的站里，我可以中英混排，可以代码和图文混排，可以不担心算法压降冷门内容。

## 这里会写什么

- AI 工具实践：我实际怎么用 ChatGPT 和 Cursor
- 推荐系统分析：公式调参、策略权衡、实验设计
- 产品工程：从想法到实现的完整思考
- 个人思考：关于构建、学习和长期主义

不追热点，只写自己真正用到的、想清楚的东西。
```

- [ ] **Step 3: Create `src/content/notes/ai-workflow.mdx`**

```mdx
---
title: "AI 如何改变程序员的工作流"
description: "从代码生成、数据分析到产品设计，我如何把 AI 融入日常工作。"
date: 2026-05-01
tag: "AI Tools"
readingTime: 6
featured: true
draft: false
---

## 问题的起点

两年前，AI 写代码对我来说是个新鲜玩具。现在，它是我每天不可或缺的工具。

变化不是一夜之间的，而是一次次被"这个它居然能做？"的体验堆积出来的。

## 代码生成：从补全到对话

我用 Cursor 已经超过一年。最大的认知转变不是"AI 写代码更快"，而是**工作模式从写代码变成了审代码**。

你描述意图，AI 产生草稿，你判断对不对、好不好。这对 senior 工程师反而比 junior 更有价值——因为判断力才是瓶颈，不是打字速度。

## 数据分析：把 Python 还给 AI

以前我自己写 pandas 代码分析日志数据。现在我描述想看什么，让 Claude 写查询，我审查结果。

节省的不只是时间，而是**进入状态的摩擦**。想分析一个指标，不需要先打开文档查 API，直接说就行。

## 产品设计：把想法变成原型

AI 最让我意外的价值是在设计阶段。把一个模糊的产品想法描述清楚，让 Claude 帮你拆解用户场景、挑战假设、给出界面思路——这个过程本身就是在思考。

## 局限

AI 不擅长：
- 真正新颖的算法设计
- 对系统整体架构的判断
- 感知"这个方向走错了"

这些还是要靠自己。AI 是放大器，不是替代品。
```

- [ ] **Step 4: Create `src/content/notes/recsys-tuning.mdx`**

```mdx
---
title: "推荐公式调参中的常见误区"
description: "信息流推荐中的 CTR、完播率和时长加权策略分析。"
date: 2026-04-22
tag: "Recommendation"
readingTime: 8
featured: true
draft: false
---

## 背景

做推荐系统调参的时候，最容易掉进的坑是**把指标优化当成目标优化**。

CTR 高 ≠ 用户满意。完播率高 ≠ 内容好。这些指标是代理变量，不是终点。

## 误区一：过度优化 CTR

高 CTR 的内容往往是标题党。短期数据漂亮，中期用户流失。

更好的做法：引入**后验满意度信号**——完播率、分享率、关注转化——作为 CTR 的修正项。

```
score = CTR * 0.3 + 完播率 * 0.4 + 分享率 * 0.3
```

这个权重不是固定的，要根据你的内容生态反复实验。

## 误区二：完播率歧视短视频

30秒视频完播率天然高于10分钟视频。直接用原始完播率会系统性压低长内容。

解法：**分桶归一化**——在同一时长桶内比较完播率，再跨桶加权。

## 误区三：忽视冷启动内容的探索成本

新内容没有历史数据，模型天然低估它。如果不做干预，优质新内容永远出不了圈。

常见方案是 ε-greedy 或 UCB，但在推荐场景下，更实用的是**流量分层**：

- 90% 流量：召回 + 粗排 + 精排全链路
- 10% 流量：强制探索，给新内容曝光机会，收集真实信号

## 一个简单的调参原则

调参之前先想清楚：这个指标的提升，对用户来说意味着什么？

如果答不上来，先别调。
```

- [ ] **Step 5: Verify schema validates**

```bash
npx astro check
```

Expected: no errors. If schema mismatch errors appear, check frontmatter field names match `content.config.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/content/
git commit -m "feat: add content schema and 3 seed articles"
```

---

## Task 4: Content Abstraction Layer

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/content.ts`

- [ ] **Step 1: Create `src/lib/utils.ts`**

```ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

- [ ] **Step 2: Create `src/lib/content.ts`**

```ts
import { getCollection, getEntry } from 'astro:content';

export type Note = {
  id: string;
  title: string;
  description: string;
  date: Date;
  updatedDate?: Date;
  tag: 'AI Tools' | 'Recommendation' | 'Product Engineering' | 'Thinking';
  readingTime: number;
  featured: boolean;
  draft: boolean;
};

type CollectionEntry = Awaited<ReturnType<typeof getCollection<'notes'>>>[number];

function toNote(entry: CollectionEntry): Note {
  return { id: entry.id, ...entry.data };
}

export async function getNotes(): Promise<Note[]> {
  const entries = await getCollection('notes', ({ data }) => !data.draft);
  return entries
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map(toNote);
}

export async function getFeaturedNotes(): Promise<Note[]> {
  const all = await getNotes();
  const featured = all.filter(n => n.featured);
  if (featured.length >= 2) return featured.slice(0, 2);
  const nonFeatured = all.filter(n => !n.featured);
  return [...featured, ...nonFeatured].slice(0, 2);
}

export async function getNotesByTag(tag: Note['tag']): Promise<Note[]> {
  const all = await getNotes();
  return all.filter(n => n.tag === tag);
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const entry = await getEntry('notes', slug);
  if (!entry || entry.data.draft) return null;
  return toNote(entry);
}

export async function getRelatedNote(current: Note): Promise<Note | null> {
  const all = await getNotes();
  const sameTag = all.filter(n => n.tag === current.tag && n.id !== current.id);
  if (sameTag.length > 0) return sameTag[0];
  const others = all.filter(n => n.id !== current.id);
  return others[0] ?? null;
}
```

- [ ] **Step 3: Verify types**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add content abstraction layer (lib/content.ts)"
```

---

## Task 5: Base Layout

**Files:**
- Create: `src/components/ui/Navbar.astro`
- Create: `src/components/ui/Footer.astro`
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/components/ui/Navbar.astro`**

```astro
---
const { pathname } = Astro.url;
const links = [
  { href: '/notes', label: 'AI Notes' },
  { href: '/about', label: 'About' },
];
---

<header class="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]/40">
  <nav class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <a href="/" class="font-semibold text-[var(--color-text)] text-sm tracking-tight hover:opacity-70 transition-opacity">
      YourName
    </a>
    <div class="flex items-center gap-6">
      {links.map(({ href, label }) => (
        <a
          href={href}
          class:list={[
            'text-sm transition-colors',
            pathname.startsWith(href)
              ? 'text-[var(--color-accent)] font-medium'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]',
          ]}
        >
          {label}
        </a>
      ))}
    </div>
  </nav>
</header>
```

- [ ] **Step 2: Create `src/components/ui/Footer.astro`**

```astro
---
const links = [
  { href: 'mailto:your@email.com', label: 'Email' },
  { href: 'https://github.com/yourusername', label: 'GitHub' },
  { href: 'https://linkedin.com/in/yourusername', label: 'LinkedIn' },
  { href: 'https://x.com/yourusername', label: 'X' },
];
---

<footer class="border-t border-[var(--color-border)] mt-24">
  <div class="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <span class="text-sm text-[var(--color-muted)]">© 2026 YourName</span>
    <div class="flex items-center gap-5">
      {links.map(({ href, label }) => (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          class="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          {label}
        </a>
      ))}
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Create `src/layouts/Base.astro`**

```astro
---
import Navbar from '../components/ui/Navbar.astro';
import Footer from '../components/ui/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

const {
  title,
  description,
  ogType = 'website',
  publishedTime,
  modifiedTime,
} = Astro.props;

const siteTitle = title.includes('YourName') ? title : `${title} — YourName`;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{siteTitle}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={siteTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={ogType} />
    {publishedTime && <meta property="article:published_time" content={publishedTime} />}
    {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="min-h-screen">
    <Navbar />
    <main class="pt-14">
      <slot />
    </main>
    <Footer />
    <script>
      import '../scripts/reveal';
    </script>
  </body>
</html>
```

- [ ] **Step 4: Verify**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Navbar.astro src/components/ui/Footer.astro src/layouts/Base.astro
git commit -m "feat: add Base layout with Navbar and Footer"
```

---

## Task 6: UI Atoms

**Files:**
- Create: `src/components/ui/Button.astro`
- Create: `src/components/ui/Tag.astro`
- Create: `src/components/ui/NoteCard.astro`

- [ ] **Step 1: Create `src/components/ui/Button.astro`**

```astro
---
interface Props {
  href: string;
  variant?: 'primary' | 'outline';
}
const { href, variant = 'primary' } = Astro.props;
---

<a
  href={href}
  class:list={[
    'inline-block px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-80',
    variant === 'primary'
      ? 'bg-[var(--color-accent)] text-white'
      : 'border border-[var(--color-border)] text-[var(--color-text)]',
  ]}
>
  <slot />
</a>
```

- [ ] **Step 2: Create `src/components/ui/Tag.astro`**

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---

<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[var(--color-accent)]">
  {label}
</span>
```

- [ ] **Step 3: Create `src/components/ui/NoteCard.astro`**

```astro
---
import Tag from './Tag.astro';
import type { Note } from '../../lib/content';
import { formatDate } from '../../lib/utils';

interface Props {
  note: Note;
}
const { note } = Astro.props;
---

<a
  href={`/notes/${note.id}`}
  class="block p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] hover:shadow-md transition-shadow group"
>
  <Tag label={note.tag} />
  <h3 class="mt-3 text-base font-semibold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-accent)] transition-colors">
    {note.title}
  </h3>
  <p class="mt-2 text-sm text-[var(--color-muted)] line-clamp-2">{note.description}</p>
  <p class="mt-3 text-xs text-[var(--color-muted)]">{formatDate(note.date)} · {note.readingTime} min read</p>
</a>
```

- [ ] **Step 4: Verify**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.astro src/components/ui/Tag.astro src/components/ui/NoteCard.astro
git commit -m "feat: add Button, Tag, NoteCard UI atoms"
```

---

## Task 7: Homepage Sections

**Files:**
- Create: `src/components/sections/Hero.astro`
- Create: `src/components/sections/FocusCards.astro`
- Create: `src/components/sections/FeaturedNotes.astro`
- Create: `src/components/sections/Belief.astro`

- [ ] **Step 1: Create `src/components/sections/Hero.astro`**

```astro
---
import Button from '../ui/Button.astro';
---

<section class="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24">
  <h1 class="fade-up text-5xl sm:text-6xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
    程序员。<br />AI 实践者。<br />产品构建者。
  </h1>
  <p class="fade-up mt-6 max-w-md text-lg text-[var(--color-muted)] leading-relaxed" style="transition-delay:100ms">
    分享 AI 工具实践、推荐系统分析、产品工程经验，以及一些自己构建的小项目。
  </p>
  <div class="fade-up flex gap-3 mt-8" style="transition-delay:200ms">
    <Button href="/notes">读 AI Notes</Button>
    <Button href="/about" variant="outline">关于我</Button>
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/sections/FocusCards.astro`**

```astro
---
const focuses = [
  {
    title: 'AI Tools',
    description: '记录 ChatGPT、Cursor、Agent 等 AI 工具的实践方式。',
  },
  {
    title: 'Recommendation',
    description: '分析推荐公式、内容分发、CTR 与完播率混排策略。',
  },
  {
    title: 'Product Engineering',
    description: '分享从想法、设计到工程实现的完整构建过程。',
  },
];
---

<section class="max-w-5xl mx-auto px-6 py-20">
  <h2 class="fade-up text-2xl font-bold text-[var(--color-text)] mb-10 text-center">我关注的方向</h2>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
    {focuses.map((item, i) => (
      <div
        class="fade-up p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]"
        style={`transition-delay:${i * 80}ms`}
      >
        <h3 class="font-semibold text-[var(--color-text)]">{item.title}</h3>
        <p class="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">{item.description}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/sections/FeaturedNotes.astro`**

```astro
---
import NoteCard from '../ui/NoteCard.astro';
import { getFeaturedNotes } from '../../lib/content';

const notes = await getFeaturedNotes();
---

{notes.length > 0 && (
  <section class="max-w-5xl mx-auto px-6 py-20">
    <h2 class="fade-up text-2xl font-bold text-[var(--color-text)] mb-10">精选 Notes</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {notes.map((note, i) => (
        <div class="fade-up" style={`transition-delay:${i * 80}ms`}>
          <NoteCard note={note} />
        </div>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 4: Create `src/components/sections/Belief.astro`**

```astro
<section class="bg-[var(--color-bg-dark)] py-24 px-6 text-center">
  <p class="fade-up max-w-2xl mx-auto text-xl sm:text-2xl font-semibold text-white leading-relaxed">
    我相信 AI 不只是工具，<br />
    它正在成为新的思考方式、构建方式和创造界面。
  </p>
</section>
```

- [ ] **Step 5: Verify**

```bash
npx astro check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/
git commit -m "feat: add homepage sections (Hero, FocusCards, FeaturedNotes, Belief)"
```

---

## Task 8: Homepage Page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/sections/Hero.astro';
import FocusCards from '../components/sections/FocusCards.astro';
import FeaturedNotes from '../components/sections/FeaturedNotes.astro';
import Belief from '../components/sections/Belief.astro';
---

<Base
  title="YourName — AI Builder Notes"
  description="一个关注 AI、推荐系统和产品工程的程序员，记录技术实践、AI 观察和个人构建过程。"
>
  <Hero />
  <FocusCards />
  <FeaturedNotes />
  <Belief />
</Base>
```

- [ ] **Step 2: Start dev server and spot-check homepage**

```bash
npx astro dev
```

Open `http://localhost:4321`. Verify:
- Navbar at top with blur effect
- Hero text readable, CTAs present
- Focus cards in 3-column grid
- Featured notes showing 2 articles
- Belief section with dark background
- Footer with links

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build homepage"
```

---

## Task 9: Notes List Page

**Files:**
- Create: `src/components/sections/NotesList.astro`
- Create: `src/pages/notes/index.astro`

- [ ] **Step 1: Create `src/components/sections/NotesList.astro`**

```astro
---
import Tag from '../ui/Tag.astro';
import type { Note } from '../../lib/content';
import { formatDate } from '../../lib/utils';

interface Props {
  notes: Note[];
}
const { notes } = Astro.props;

const tags = ['AI Tools', 'Recommendation', 'Product Engineering', 'Thinking'] as const;
---

<section class="max-w-3xl mx-auto px-6 py-12">
  <!-- Tag filter bar -->
  <div class="flex flex-wrap gap-2 mb-10" id="tag-filter">
    <button
      data-tag="all"
      class="tag-btn px-3.5 py-1 rounded-full text-sm font-medium transition-colors bg-[var(--color-accent)] text-white"
    >
      All
    </button>
    {tags.map(tag => (
      <button
        data-tag={tag}
        class="tag-btn px-3.5 py-1 rounded-full text-sm font-medium transition-colors bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        {tag}
      </button>
    ))}
  </div>

  <!-- Article list -->
  <div class="divide-y divide-[var(--color-border)]">
    {notes.map(note => (
      <article
        class="fade-up py-5 note-row"
        data-tag={note.tag}
      >
        <a href={`/notes/${note.id}`} class="group block">
          <h2 class="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
            {note.title}
          </h2>
          <p class="mt-1.5 text-sm text-[var(--color-muted)]">{note.description}</p>
          <p class="mt-2 text-xs text-[var(--color-muted)]">
            {formatDate(note.date)} · <span class="text-[var(--color-accent)]">{note.tag}</span> · {note.readingTime} min read
          </p>
        </a>
      </article>
    ))}
  </div>
</section>

<script>
  // Restore tag from URL on load, handle filter clicks
  const params = new URLSearchParams(window.location.search);
  const initialTag = params.get('tag') ?? 'all';

  function applyFilter(tag: string) {
    // Update button styles
    document.querySelectorAll<HTMLButtonElement>('.tag-btn').forEach(btn => {
      const active = btn.dataset.tag === tag;
      btn.classList.toggle('bg-[var(--color-accent)]', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-[var(--color-bg)]', !active);
      btn.classList.toggle('border', !active);
      btn.classList.toggle('text-[var(--color-muted)]', !active);
    });

    // Show/hide rows
    document.querySelectorAll<HTMLElement>('.note-row').forEach(row => {
      row.style.display = tag === 'all' || row.dataset.tag === tag ? '' : 'none';
    });

    // Update URL
    const url = new URL(window.location.href);
    if (tag === 'all') {
      url.searchParams.delete('tag');
    } else {
      url.searchParams.set('tag', tag);
    }
    window.history.replaceState(null, '', url.toString());
  }

  // Apply initial state
  applyFilter(initialTag);

  // Wire up buttons
  document.querySelectorAll<HTMLButtonElement>('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.tag ?? 'all'));
  });
</script>
```

- [ ] **Step 2: Create `src/pages/notes/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import NotesList from '../../components/sections/NotesList.astro';
import { getNotes } from '../../lib/content';

const notes = await getNotes();
---

<Base
  title="AI Notes — YourName"
  description="关于 AI、推荐系统和产品工程的实践记录。"
>
  <div class="max-w-3xl mx-auto px-6 pt-16 pb-4">
    <h1 class="fade-up text-4xl font-bold text-[var(--color-text)] tracking-tight">AI Notes</h1>
    <p class="fade-up mt-3 text-[var(--color-muted)]" style="transition-delay:80ms">
      关于 AI、推荐系统和产品工程的实践记录。
    </p>
  </div>
  <NotesList notes={notes} />
</Base>
```

- [ ] **Step 3: Spot-check notes list in dev server**

Open `http://localhost:4321/notes`. Verify:
- 3 articles appear
- Clicking `AI Tools` hides non-matching articles and updates URL to `?tag=AI+Tools`
- Clicking `All` restores all articles
- Opening `http://localhost:4321/notes?tag=Recommendation` directly loads with Recommendation filter active

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/NotesList.astro src/pages/notes/index.astro
git commit -m "feat: add notes list page with URL-persisted tag filter"
```

---

## Task 10: Article Detail Page

**Files:**
- Create: `src/layouts/Post.astro`
- Create: `src/pages/notes/[slug].astro`

- [ ] **Step 1: Create `src/layouts/Post.astro`**

```astro
---
import Base from './Base.astro';
import Tag from '../components/ui/Tag.astro';
import NoteCard from '../components/ui/NoteCard.astro';
import type { Note } from '../lib/content';
import { formatDate } from '../lib/utils';

interface Props {
  note: Note;
  related: Note | null;
}
const { note, related } = Astro.props;
---

<Base
  title={note.title}
  description={note.description}
  ogType="article"
  publishedTime={note.date.toISOString()}
  modifiedTime={note.updatedDate?.toISOString()}
>
  <article class="max-w-2xl mx-auto px-6 pt-16 pb-24">
    <!-- Back link -->
    <a href="/notes" class="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
      ← AI Notes
    </a>

    <!-- Header -->
    <header class="mt-6">
      <Tag label={note.tag} />
      <h1 class="mt-4 text-3xl sm:text-4xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
        {note.title}
      </h1>
      <div class="mt-3 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
        <span>{formatDate(note.date)}</span>
        {note.updatedDate && note.updatedDate.getTime() !== note.date.getTime() && (
          <span>· Updated {formatDate(note.updatedDate)}</span>
        )}
        <span>· {note.readingTime} min read</span>
      </div>
    </header>

    <!-- Prose body -->
    <div class="mt-10 prose prose-lg max-w-none
      prose-headings:font-semibold prose-headings:text-[var(--color-text)]
      prose-p:text-[var(--color-text)] prose-p:leading-relaxed
      prose-a:text-[var(--color-accent)] prose-a:no-underline hover:prose-a:underline
      prose-code:font-mono prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-pre:bg-gray-50 prose-pre:rounded-xl prose-pre:border prose-pre:border-[var(--color-border)]">
      <slot />
    </div>

    <!-- Related article -->
    {related && (
      <aside class="mt-16 pt-8 border-t border-[var(--color-border)]">
        <h2 class="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-4">继续阅读</h2>
        <NoteCard note={related} />
      </aside>
    )}
  </article>
</Base>
```

- [ ] **Step 2: Install `@tailwindcss/typography` for prose styles**

```bash
npm install -D @tailwindcss/typography
```

Add to `src/styles/global.css` after `@import "tailwindcss"`:
```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: Create `src/pages/notes/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import Post from '../../layouts/Post.astro';
import { getNoteBySlug, getRelatedNote } from '../../lib/content';

export async function getStaticPaths() {
  const entries = await getCollection('notes', ({ data }) => !data.draft);
  return entries.map(entry => ({ params: { slug: entry.id } }));
}

const { slug } = Astro.params;
const note = await getNoteBySlug(slug);

if (!note) return Astro.redirect('/notes');

const entry = await (await import('astro:content')).getEntry('notes', slug);
const { Content } = await entry!.render();
const related = await getRelatedNote(note);
---

<Post note={note} related={related}>
  <Content />
</Post>
```

- [ ] **Step 4: Spot-check article detail**

Open `http://localhost:4321/notes/ai-workflow`. Verify:
- Title, tag, date, reading time appear
- Prose renders correctly with code blocks styled
- "继续阅读" section shows a related article
- Back link works

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Post.astro src/pages/notes/[slug].astro
git commit -m "feat: add article detail page with related note and prose styles"
```

---

## Task 11: About Page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const focuses = [
  'AI Tools & Workflow',
  'Recommendation Systems',
  'Product Engineering',
  'Personal Knowledge & Writing',
];

const contacts = [
  { label: 'Email', href: 'mailto:your@email.com' },
  { label: 'GitHub', href: 'https://github.com/yourusername' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/yourusername' },
  { label: 'X', href: 'https://x.com/yourusername' },
];
---

<Base
  title="About — YourName"
  description="一名关注 AI、推荐系统与产品工程的程序员。"
>
  <div class="max-w-2xl mx-auto px-6 pt-16 pb-24">

    <!-- Avatar + Name -->
    <div class="fade-up flex items-center gap-5 mb-10">
      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
        👤
      </div>
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text)]">YourName</h1>
        <p class="text-sm text-[var(--color-muted)] mt-0.5">Software Engineer · AI Explorer · Builder</p>
      </div>
    </div>

    <!-- Bio -->
    <div class="fade-up mb-12" style="transition-delay:80ms">
      <p class="text-[var(--color-text)] leading-relaxed">
        你好，我是 XXX。<br />
        一名关注 AI、推荐系统与产品工程的程序员。<br />
        我在这里记录 AI 工具实践、技术分析、产品思考和个人构建过程。
      </p>
    </div>

    <!-- Focus -->
    <div class="fade-up mb-12" style="transition-delay:160ms">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">Focus</h2>
      <ul class="space-y-3">
        {focuses.map(item => (
          <li class="flex items-center gap-3 text-[var(--color-text)]">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>

    <!-- Contact -->
    <div class="fade-up" style="transition-delay:240ms">
      <h2 class="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-4">Contact</h2>
      <p class="text-sm text-[var(--color-muted)] mb-5">
        如果你也关注 AI 产品、推荐系统或个人工具构建，欢迎交流。
      </p>
      <div class="flex flex-wrap gap-3">
        {contacts.map(({ label, href }) => (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            class="px-4 py-1.5 rounded-full border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            {label}
          </a>
        ))}
      </div>
    </div>

  </div>
</Base>
```

- [ ] **Step 2: Spot-check About page**

Open `http://localhost:4321/about`. Verify:
- Avatar, name, title row renders
- Bio paragraph readable
- Focus list with 4 items
- Contact buttons link correctly

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: add About page"
```

---

## Task 12: Final Build and Vercel Deployment

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Full build verification**

```bash
npx astro check && npx astro build
```

Expected:
- `astro check`: 0 errors
- `astro build`: `Build complete` — all 5 routes generated (`/`, `/notes`, `/notes/ai-workflow`, `/notes/recsys-tuning`, `/notes/why-this-site`, `/about`)

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "buildCommand": "npx astro build",
  "outputDirectory": "dist",
  "devCommand": "npx astro dev",
  "installCommand": "npm install",
  "framework": "astro"
}
```

- [ ] **Step 3: Verify responsive layout**

In dev server, use browser DevTools to simulate mobile (375px width). Check:
- Navbar links remain accessible (no overlap)
- Hero headline wraps cleanly
- Focus cards stack to single column
- Article prose readable

- [ ] **Step 4: Final commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel deployment config"
```

- [ ] **Step 5: Push to GitHub and deploy**

```bash
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

Then go to vercel.com → Import Git Repository → select repo → Deploy.

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Astro 5 + `@astrojs/mdx` + `@tailwindcss/vite` | Task 1 |
| `src/content.config.ts` with Zod schema | Task 3 |
| `draft` + `updatedDate` frontmatter fields | Task 3 |
| `lib/content.ts` abstraction (all 5 functions) | Task 4 |
| `scripts/reveal.ts` scroll reveal | Task 2 |
| `prefers-reduced-motion` + JS failure fallback | Task 2 |
| Homepage 5-section layout | Tasks 7–8 |
| FeaturedNotes 3-level fallback | Task 7 (getFeaturedNotes in Task 4) |
| Notes list with URL `?tag=` filter state | Task 9 |
| Article detail + related note fallback | Task 10 |
| `updatedDate` "Updated" label in article | Task 10 |
| Draft articles → 404 | Task 10 (`getStaticPaths` filter) |
| About page | Task 11 |
| SEO metadata on all pages | Tasks 5, 8, 9, 10, 11 (via Base.astro props) |
| OG `article:published_time` + `modified_time` | Task 5 (Base.astro) |
| Vercel deployment | Task 12 |
| `.superpowers/` in `.gitignore` | Task 1 |

All spec requirements covered.
