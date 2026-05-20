export type ProjectStatus = 'building' | 'done' | 'idea';

export interface Project {
  name: string;
  subtitle: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  url: string | null;
}

export const projects: Project[] = [
  {
    name: 'Market Radar',
    subtitle: '美股 ETF 智能监控台',
    description: '个人投资监控网页：每日自动拉取美股指数、ETF、龙头股行情，计算均线指标，聚合新闻并用 AI 生成摘要，输出关注等级和定投建议。',
    stack: ['Next.js', 'Supabase', 'Tailwind CSS', 'ECharts', 'OpenAI API', 'GitHub Actions', 'Vercel'],
    status: 'done',
    url: 'https://market-radar-dandylaw-s-projects.vercel.app',
  },
  {
    name: '工艺品公众号发布系统',
    subtitle: 'AI 辅助写作 · 一键推送微信草稿箱',
    description: '供个人创作者用的 Web 工具，输入提示词 + 上传图片，AI 生成工艺品主题文章，支持多公众号管理、TipTap 富文本编辑，一键提交微信草稿箱。',
    stack: ['Vue3', 'FastAPI', 'SQLite', 'TipTap', 'DeepSeek', 'wechatpy', 'AES-256'],
    status: 'done',
    url: null,
  },
  {
    name: '爷爷的厨房',
    subtitle: '家庭点单小程序',
    description: '一个面向家庭场景的微信小程序，让家人点菜、爷爷看单，并通过本地提醒和分享功能协调整个家庭厨房。',
    stack: ['微信小程序', 'JavaScript', 'WXML', 'WXSS', 'Node.js'],
    status: 'done',
    url: null,
  },
];

export const statusMap: Record<ProjectStatus, { label: string; color: string }> = {
  building: { label: 'Building', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  done:     { label: 'Done',     color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  idea:     { label: 'Idea',     color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
};
