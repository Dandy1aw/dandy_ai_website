# Dandy AI Website

个人网站，记录 AI 工具实践、推荐系统分析与产品工程经验。

## Tech Stack

- [Astro 6](https://astro.build/) — SSG 静态站点框架
- [Tailwind CSS v4](https://tailwindcss.com/) — 样式
- [MDX](https://mdxjs.com/) — 文章内容
- [Vercel](https://vercel.com/) — 部署

## Pages

| 路由 | 说明 |
|---|---|
| `/` | 首页 |
| `/notes` | 文章列表（支持 Tag 筛选） |
| `/notes/[slug]` | 文章详情 |
| `/about` | 关于我 |

## Getting Started

```bash
npm install
npm run dev       # 本地开发 http://localhost:4321
npm run build     # 构建静态文件到 dist/
```

## Content

文章存放在 `src/content/notes/`，MDX 格式，frontmatter 字段：

```yaml
---
title: "文章标题"
description: "一行简介"
date: 2026-05-01
tag: "AI Tools"        # AI Tools | Recommendation | Product Engineering | Thinking
readingTime: 6         # 分钟
featured: true         # 是否在首页展示
draft: false           # true 则不构建
---
```
