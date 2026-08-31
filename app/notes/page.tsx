"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ContentHeader } from "../components/SiteHeaders";

type ThemeMode = "day" | "night";
type NoteCategory = "tutorials" | "rants" | "wiki";
type ReaderSize = "small" | "medium" | "large";

type NoteItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
};

const categories: Array<{ id: NoteCategory; index: string; label: string; english: string; mark: string; description: string }> = [
  { id: "tutorials", index: "01", label: "教程", english: "PRACTICAL GUIDES", mark: "教", description: "可以一步步跟着完成的制作过程，重点记录判断、参数和容易踩到的坑。" },
  { id: "rants", index: "02", label: "吐槽", english: "HONEST NOTES", mark: "谈", description: "短一点、主观一点的使用感受。保留情绪，也尽量把问题讲清楚。" },
  { id: "wiki", index: "03", label: "百科", english: "PERSONAL WIKI", mark: "知", description: "把反复查找的概念、工具和术语整理成自己的知识词典。" },
];

const notes: Record<NoteCategory, NoteItem[]> = {
  tutorials: [
    { id: "tu-01", title: "把 Three.js 场景做成可运镜的个人首页", summary: "从镜头预设、缓动到物体点击，拆解一套可维护的交互结构。", date: "2026.08.18", readTime: "12 分钟", tags: ["Three.js", "React", "3D"] },
    { id: "tu-02", title: "漫画 OCR 编辑器的最小实现", summary: "上传、框选、识别、翻译与校对，一次完成最小闭环。", date: "2026.08.12", readTime: "9 分钟", tags: ["OCR", "FastAPI", "AI"] },
    { id: "tu-03", title: "用 Blender 准备网页用 GLB 模型", summary: "控制模型体积、材质和坐标原点，让浏览器加载更轻松。", date: "2026.07.28", readTime: "15 分钟", tags: ["Blender", "GLB", "优化"] },
    { id: "tu-04", title: "从一张参考图整理网站视觉规范", summary: "不是照着画，而是提取字体、间距、圆角和配色规律。", date: "2026.07.15", readTime: "8 分钟", tags: ["UI", "视觉系统", "设计"] },
  ],
  rants: [
    { id: "ra-01", title: "为什么每个效率工具最后都想变成操作系统", summary: "本来只想记一行字，最后却要先学习它的世界观。", date: "2026.08.16", readTime: "4 分钟", tags: ["工具", "产品", "主观体验"] },
    { id: "ra-02", title: "教程里最没用的一句话：剩下的很简单", summary: "对作者来说简单，不代表读者知道省略掉的三十个选择。", date: "2026.08.02", readTime: "3 分钟", tags: ["教程", "写作", "踩坑"] },
    { id: "ra-03", title: "AI 生成了十张图，但我还是不知道想要什么", summary: "选择变多不等于方向更清楚，参考图也需要先被整理。", date: "2026.07.21", readTime: "5 分钟", tags: ["AI", "创作", "审美"] },
    { id: "ra-04", title: "不要为了一个按钮安装整套宇宙飞船", summary: "轻量工具最珍贵的品质，是打开以后立刻知道怎么用。", date: "2026.07.03", readTime: "4 分钟", tags: ["开发", "轻量", "体验"] },
  ],
  wiki: [
    { id: "wi-01", title: "OCR：从图片里读出文字", summary: "文字检测、字符识别、版面分析和人工校对之间是什么关系。", date: "更新于 2026.08", readTime: "6 分钟", tags: ["AI", "图像识别", "术语"] },
    { id: "wi-02", title: "GLB 与 glTF", summary: "网页三维模型常见格式、纹理打包方式和使用场景。", date: "更新于 2026.07", readTime: "5 分钟", tags: ["3D", "格式", "WebGL"] },
    { id: "wi-03", title: "2.5D 与等距视角", summary: "为什么有些画面看起来像三维，但仍然保持插画的可读性。", date: "更新于 2026.07", readTime: "4 分钟", tags: ["视觉", "构图", "等距"] },
    { id: "wi-04", title: "什么是本地优先", summary: "数据先保存在设备上，再决定是否同步的一种产品思路。", date: "更新于 2026.06", readTime: "5 分钟", tags: ["产品", "隐私", "数据"] },
  ],
};

function TutorialContent({ note }: { note: NoteItem }) {
  const [copyLabel, setCopyLabel] = useState("复制");
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText('const workflow = {\n  input: "准备内容",\n  process: "处理与校对",\n  output: "展示最终结果",\n};');
      setCopyLabel("已复制");
      window.setTimeout(() => setCopyLabel("复制"), 1200);
    } catch {
      setCopyLabel("复制失败");
    }
  };
  return (
    <>
      <section id="goal"><h2><span>01</span> 先确定这篇教程要解决什么</h2><p>这篇文章以“{note.title}”为目标，不追求一次讲完所有知识，而是先做出一个可以运行、可以调试、也方便继续扩展的版本。</p><div className="notes-callout"><b>完成以后你会得到</b><p>一套可以复用的结构、一组明确参数，以及出现问题时知道应该检查哪里的排错路径。</p></div></section>
      <section id="structure"><h2><span>02</span> 把复杂过程拆成几个稳定模块</h2><p>先把输入、状态、展示和交互分开。每个模块只负责一类事情，后面替换模型、接口或视觉样式时，就不需要从头改整页。</p><div className="notes-code"><header><span>structure.ts</span><button type="button" onClick={copyCode}>{copyLabel}</button></header><pre>{`const workflow = {\n  input: "准备内容",\n  process: "处理与校对",\n  output: "展示最终结果",\n};`}</pre></div></section>
      <section id="steps"><h2><span>03</span> 按最小闭环开始实现</h2><ol className="notes-step-list"><li><b>先让核心流程跑通</b><p>暂时使用演示数据，确认页面结构和状态切换没有问题。</p></li><li><b>再接入真实内容</b><p>每替换一项真实能力，就保留一个可以回退的结果。</p></li><li><b>最后处理异常和移动端</b><p>空数据、加载失败、窄屏和触摸操作都需要单独检查。</p></li></ol></section>
      <section id="check"><h2><span>04</span> 发布前检查</h2><ul className="notes-check-list"><li>核心操作是否有明确反馈</li><li>刷新页面后是否仍能正常进入</li><li>键盘和触摸操作是否可用</li><li>失败时是否告诉用户下一步做什么</li></ul></section>
    </>
  );
}

function RantContent({ note }: { note: NoteItem }) {
  return (
    <>
      <section id="moment"><div className="notes-rant-time">09:42 · 第一次产生这个想法</div><h2>{note.title}</h2><p>事情通常从一个很小的需求开始：我只想快速完成眼前这一步。但当工具要求我先理解十个概念、建立三层目录、选择五种模板时，最初的问题已经被藏起来了。</p></section>
      <section id="problem"><div className="notes-rant-time">10:18 · 问题可能不在功能数量</div><p>功能多并不是坏事，真正让人疲惫的是它没有告诉我：现在最应该使用哪一个。一个成熟的产品应该帮用户减少判断，而不是把设计阶段的所有选择原样交还给用户。</p><blockquote>复杂能力可以藏在后面，但第一步必须足够清楚。</blockquote></section>
      <section id="after"><div className="notes-rant-time">11:06 · 冷静以后再补一句</div><p>也许我吐槽的不是某个工具，而是所有“越做越完整”的冲动。下一次开发自己的小工具时，也应该问问：这个新增入口真的解决问题，还是只让首页看起来更丰富？</p><div className="notes-rant-meter"><span>今日情绪值</span><div><i style={{ width: "72%" }} /></div><b>72 / 100</b></div></section>
    </>
  );
}

function WikiContent({ note }: { note: NoteItem }) {
  return (
    <>
      <section id="definition"><p className="notes-wiki-label">DEFINITION · 定义</p><h2>{note.title}</h2><p><strong>{note.title.split("：")[0]}</strong> 是我在项目中反复遇到的一个概念。这个词条优先解释它解决什么问题、由哪些部分组成，以及什么时候不应该使用。</p><div className="notes-wiki-summary"><span>一句话理解</span><p>{note.summary}</p></div></section>
      <section id="components"><p className="notes-wiki-label">COMPONENTS · 组成</p><h2>它通常包含哪些部分</h2><div className="notes-definition-grid"><article><span>01</span><b>输入</b><p>需要被处理的原始内容或状态。</p></article><article><span>02</span><b>处理</b><p>算法、规则或人工判断发生的阶段。</p></article><article><span>03</span><b>结果</b><p>可继续编辑、保存或展示的输出。</p></article></div></section>
      <section id="usage"><p className="notes-wiki-label">USAGE · 使用</p><h2>什么时候值得使用</h2><table><tbody><tr><th>适合</th><td>重复出现、边界清楚、可以验证结果的问题。</td></tr><tr><th>不适合</th><td>需求还没有被理解，只是为了使用某项新技术。</td></tr><tr><th>检查</th><td>是否真的减少了时间、步骤或认知负担。</td></tr></tbody></table></section>
      <section id="related"><p className="notes-wiki-label">RELATED · 相关词条</p><h2>可以一起阅读</h2><div className="notes-related-terms"><span>版面分析</span><span>本地优先</span><span>人工校对</span><span>可解释结果</span></div></section>
    </>
  );
}

export default function NotesPage() {
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [activeCategory, setActiveCategory] = useState<NoteCategory>("tutorials");
  const [selectedId, setSelectedId] = useState(notes.tutorials[0].id);
  const [readerSize, setReaderSize] = useState<ReaderSize>("medium");
  const [focusMode, setFocusMode] = useState(false);
  const category = categories.find((item) => item.id === activeCategory) ?? categories[0];
  const categoryNotes = notes[activeCategory];
  const selectedNote = useMemo(() => categoryNotes.find((item) => item.id === selectedId) ?? categoryNotes[0], [categoryNotes, selectedId]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("creative-desk-theme");
    if (savedTheme === "day" || savedTheme === "night") setTheme(savedTheme);
  }, []);

  const changeCategory = (next: NoteCategory) => {
    setActiveCategory(next);
    setSelectedId(notes[next][0].id);
    setFocusMode(false);
  };

  const toggleTheme = () => setTheme((current) => {
    const next = current === "day" ? "night" : "day";
    window.localStorage.setItem("creative-desk-theme", next);
    return next;
  });

  const toc = activeCategory === "tutorials"
    ? [["goal", "目标"], ["structure", "结构"], ["steps", "实现步骤"], ["check", "发布检查"]]
    : activeCategory === "rants"
      ? [["moment", "事情开始"], ["problem", "真正的问题"], ["after", "冷静以后"]]
      : [["definition", "定义"], ["components", "组成"], ["usage", "使用场景"], ["related", "相关词条"]];

  return (
    <main className={`notes-page${focusMode ? " is-focus" : ""}`} data-theme={theme} data-size={readerSize}>
      <ContentHeader subtitle="NOTES & FIELD GUIDE" activeHref="/notes" theme={theme} onToggleTheme={toggleTheme} />

      <nav className="notes-category-tabs content-tool-sections" aria-label="笔记子栏目" role="tablist" style={{ "--section-columns": 3 } as CSSProperties}>{categories.map((item) => <button key={item.id} type="button" role="tab" aria-selected={activeCategory === item.id} className={activeCategory === item.id ? "is-active" : ""} onClick={() => changeCategory(item.id)}><span>{item.mark}</span><strong><small>{item.index} · {item.english}</small>{item.label}</strong><i>{item.id === activeCategory ? "当前" : "查看"}</i></button>)}</nav>

      <section className="notes-section-heading"><div><p>{category.english}</p><h2>{category.label}</h2></div><p>{category.description}</p><span>{String(categoryNotes.length).padStart(2, "0")} ARTICLES</span></section>

      <section className="notes-reading-layout">
        <aside className="notes-index">
          <div className="notes-index-heading"><span>文章目录</span><b>{category.label}</b></div>
          <div className="notes-index-list">{categoryNotes.map((note, index) => <button type="button" key={note.id} className={selectedNote.id === note.id ? "is-active" : ""} onClick={() => setSelectedId(note.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{note.title}</strong><small>{note.summary}</small><em>{note.readTime}</em></button>)}</div>
        </aside>

        <article className="notes-reader" key={selectedNote.id}>
          <header className="notes-article-header"><div className="notes-article-meta"><span>{category.label}</span><i />{selectedNote.date}<i />{selectedNote.readTime}</div><h1>{selectedNote.title}</h1><p>{selectedNote.summary}</p><div className="notes-article-tags">{selectedNote.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></header>
          <div className="notes-article-body">{activeCategory === "tutorials" ? <TutorialContent note={selectedNote} /> : activeCategory === "rants" ? <RantContent note={selectedNote} /> : <WikiContent note={selectedNote} />}</div>
          <footer className="notes-article-footer"><span>最后整理：{selectedNote.date}</span><button type="button" onClick={() => { setFocusMode(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>返回文章目录 ↑</button></footer>
        </article>

        <aside className="notes-reader-tools">
          <div className="notes-tools-card"><span>阅读设置</span><div className="notes-font-switch" aria-label="正文字号">{(["small", "medium", "large"] as ReaderSize[]).map((size, index) => <button key={size} type="button" className={readerSize === size ? "is-active" : ""} onClick={() => setReaderSize(size)}>A{index ? "+".repeat(index) : ""}</button>)}</div><button className="notes-focus-toggle" type="button" onClick={() => setFocusMode((current) => !current)}>{focusMode ? "退出专注" : "专注阅读"}</button></div>
          <nav className="notes-toc" aria-label="文章内目录"><span>本页目录</span>{toc.map(([id, label], index) => <a key={id} href={`#${id}`}><i>{String(index + 1).padStart(2, "0")}</i>{label}</a>)}</nav>
        </aside>
      </section>

      <footer className="notes-footer"><span>© 2026 奇想书桌</span><span>写给未来会再次遇到同一个问题的自己。</span></footer>
    </main>
  );
}
