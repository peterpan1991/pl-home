"use client";

import type { CSSProperties } from "react";
import { ContentHeader } from "../components/SiteHeaders";
import { sitePath } from "../lib/sitePath";
import { useTheme } from "../lib/useTheme";

const attributes = [
  { key: "AI", label: "AI 应用", score: 80, rank: "A" },
  { key: "BE", label: "后端系统", score: 90, rank: "S" },
  { key: "FE", label: "前端交互", score: 85, rank: "A+" },
  { key: "ENG", label: "工程交付", score: 85, rank: "A+" },
  { key: "ARCH", label: "架构设计", score: 85, rank: "A+" },
  { key: "BIZ", label: "业务落地", score: 95, rank: "S" },
] as const;

const skillBranches = [
  {
    id: "ai",
    icon: "✦",
    title: "AI 应用",
    subtitle: "AI APPLICATION",
    rank: "A",
    summary: "从检索、推理到界面与部署，将模型能力接入真实业务。",
    skills: ["Python", "FastAPI", "LangChain", "Ollama", "RAG", "Embedding", "ChromaDB", "FAISS", "EasyOCR", "Chinese-CLIP"],
  },
  {
    id: "backend",
    icon: "◆",
    title: "后端系统",
    subtitle: "BACKEND SYSTEM",
    rank: "S",
    summary: "长期处理支付、订单、队列、权限、第三方接口与复杂业务数据。",
    skills: ["PHP", "Laravel", "ThinkPHP", "CodeIgniter", "REST API", "MySQL", "Redis", "SQLAlchemy", "Go 协作"],
  },
  {
    id: "frontend",
    icon: "◈",
    title: "前端与客户端",
    subtitle: "FRONTEND & CLIENT",
    rank: "A+",
    summary: "覆盖网页、管理后台、小程序和桌面端，能独立完成交互与联调。",
    skills: ["React", "Vue 3", "TypeScript", "JavaScript", "Ant Design", "uni-app", "Electron", "HTML / CSS"],
  },
  {
    id: "delivery",
    icon: "⬡",
    title: "工程交付",
    subtitle: "ENGINEERING",
    rank: "A+",
    summary: "从需求拆解到上线维护，关注日志、异常、安全和可持续迭代。",
    skills: ["Docker", "Linux / CentOS", "阿里云", "数据库设计", "事务处理", "日志与异常", "部署运维", "代码审查"],
  },
] as const;

const battleRecords = [
  { number: "01", title: "Telegram 智能分析", tags: "RAG · Map-Reduce · 混合检索", result: "本地总响应由约 44 秒优化至 14–17 秒，建立 7 类检索评估场景。" },
  { number: "02", title: "英国支付网关", tags: "PAYMENTS · 3DS V2 · API", result: "8 年持续参与多渠道支付、SDK、生产支持与 Docker 部署。" },
  { number: "03", title: "网页取证桌面应用", tags: "ELECTRON · SM3 · REACT", result: "完成浏览、截图、录屏、哈希校验、证据上传与存证闭环。" },
  { number: "04", title: "本地语义检索工具", tags: "OCR · CLIP · FAISS", result: "用文字和自然语言检索本地聊天记录与图片内容。" },
] as const;

function polarPoint(index: number, radius: number) {
  const angle = -Math.PI / 2 + index * (Math.PI * 2 / attributes.length);
  return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius] as const;
}

const radarPolygon = attributes
  .map((attribute, index) => polarPoint(index, 40 * attribute.score / 100).join(","))
  .join(" ");

export default function TechStackPage() {
  const { theme, toggleTheme, noTransition } = useTheme();

  return (
    <main className={`tech-page${noTransition ? " no-transition" : ""}`} data-theme={theme} suppressHydrationWarning>
      <ContentHeader subtitle="TECH STACK" activeHref="/tech-stack" theme={theme} onToggleTheme={toggleTheme} />

      <section className="tech-command" aria-labelledby="tech-title">
        <div className="tech-command-copy">
          <p className="tech-kicker"><span>PLAYER 01</span> CHARACTER STATUS</p>
          <h1 id="tech-title">技术栈属性面板</h1>
          <p>13 年全栈开发经验，以成熟的 Web 工程能力为基础，正在向 AI 应用开发持续加点。</p>
        </div>
        <div className="tech-level" aria-label="13年开发经验"><span>LV.</span><strong>13</strong><small>YEARS EXP.</small></div>
      </section>

      <section className="tech-dashboard" aria-label="角色能力总览">
        <article className="tech-profile-panel">
          <div className="tech-profile-top">
            <div className="tech-avatar"><img src={sitePath("/brand/logo.png")} alt="猫咪角色头像" /></div>
            <div><span>MAIN CLASS</span><h2>全栈构筑师</h2><p>Full-stack Builder</p></div>
            <strong className="tech-class-rank">S</strong>
          </div>
          <dl className="tech-profile-meta">
            <div><dt>转职方向</dt><dd>AI 应用开发</dd></div>
            <div><dt>作战距离</dt><dd>需求 → 上线</dd></div>
            <div><dt>核心特性</dt><dd>独立闭环交付</dd></div>
            <div><dt>长期专精</dt><dd>业务系统 / 支付</dd></div>
          </dl>
          <div className="tech-exp-track"><span style={{ "--exp": "86%" } as CSSProperties} /><small>AI 转职进度 · 持续成长中</small></div>
        </article>

        <article className="tech-radar-panel">
          <header><div><span>ABILITY RADAR</span><h2>能力雷达</h2></div><small>基于简历项目经验的展示性概括</small></header>
          <div className="tech-radar-wrap">
            <svg className="tech-radar" viewBox="0 0 100 100" role="img" aria-label="AI应用、后端、前端、工程交付、架构设计与业务落地能力雷达图">
              {[40, 30, 20, 10].map((radius) => <polygon key={radius} points={attributes.map((_, index) => polarPoint(index, radius).join(",")).join(" ")} />)}
              {attributes.map((_, index) => { const [x, y] = polarPoint(index, 40); return <line key={index} x1="50" y1="50" x2={x} y2={y} />; })}
              <polygon className="tech-radar-value" points={radarPolygon} />
              {attributes.map((attribute, index) => { const [x, y] = polarPoint(index, 40 * attribute.score / 100); return <circle key={attribute.key} cx={x} cy={y} r="1.7" />; })}
            </svg>
            <div className="tech-radar-legend">
              {attributes.map((attribute) => <span key={attribute.key}><i>{attribute.key}</i>{attribute.label}</span>)}
            </div>
          </div>
        </article>

        <article className="tech-stats-panel">
          <header><span>BASE ATTRIBUTES</span><h2>基础属性</h2></header>
          <div className="tech-stat-list">
            {attributes.map((attribute) => (
              <div className="tech-stat" key={attribute.key}>
                <div><span>{attribute.label}</span><strong>{attribute.rank}</strong></div>
                <div className="tech-stat-track"><i style={{ "--score": `${attribute.score}%` } as CSSProperties} /></div>
                <small>{attribute.score}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="tech-section" aria-labelledby="skill-tree-title">
        <header className="tech-section-title"><div><p>SKILLS BANK</p><h2 id="skill-tree-title">技能池</h2></div><span></span></header>
        <div className="tech-skill-grid">
          {skillBranches.map((branch, index) => (
            <article className={`tech-skill-card is-${branch.id}`} key={branch.id} style={{ "--skill-order": index } as CSSProperties}>
              <div className="tech-skill-card-head"><span className="tech-skill-icon">{branch.icon}</span><div><small>{branch.subtitle}</small><h3>{branch.title}</h3></div><strong>{branch.rank}</strong></div>
              <p>{branch.summary}</p>
              <div className="tech-skill-tags">{branch.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="tech-section tech-records" aria-labelledby="records-title">
        <header className="tech-section-title"><div><p>BATTLE RECORDS</p><h2 id="records-title">实战加成</h2></div><a href={sitePath("/projects")}>查看完整项目档案 ↗</a></header>
        <div className="tech-record-list">
          {battleRecords.map((record) => (
            <article key={record.number}><span>{record.number}</span><div><small>{record.tags}</small><h3>{record.title}</h3></div><p>{record.result}</p></article>
          ))}
        </div>
      </section>

      <footer className="tech-footer"><span>© 2026 PL-HOME</span><p></p></footer>
    </main>
  );
}
