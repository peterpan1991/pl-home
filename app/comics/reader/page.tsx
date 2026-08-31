"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

type ThemeMode = "day" | "night";
type ReaderWidth = "compact" | "standard" | "wide";

type ReaderBook = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  palette: [string, string, string];
  chapters: string[];
};

const readerBooks: ReaderBook[] = [
  {
    id: "t-01",
    title: "月光邮差",
    subtitle: "写给夜晚的七封信",
    author: "森川遥",
    palette: ["#38566d", "#e4b66d", "#f2ddbd"],
    chapters: ["没有地址的信", "住在风里的收件人", "山脚下的蓝灯", "迟到十二年的回信", "月亮背面的邮局", "只在雨天出现的门", "写给夜晚的最后一封信"],
  },
  {
    id: "t-02",
    title: "云上车站",
    subtitle: "下一班列车去往春天",
    author: "青木庭",
    palette: ["#5f8d9a", "#efc285", "#f4e3cb"],
    chapters: ["云层之上的站台", "没有时刻表的列车", "装在箱子里的春天", "雨停以前", "旧票根", "终点站的来信"],
  },
  {
    id: "t-03",
    title: "深夜便利店",
    subtitle: "凌晨三点的客人",
    author: "山下由纪",
    palette: ["#313f58", "#d56f51", "#f0cf94"],
    chapters: ["凌晨三点的客人", "过期一天的牛奶", "没有影子的店员", "热气腾腾的关东煮", "清晨五点的告别"],
  },
  {
    id: "t-04",
    title: "小岛天气",
    subtitle: "今天也有风经过",
    author: "白石丘",
    palette: ["#4a8790", "#eaa66e", "#f6e6c9"],
    chapters: ["南边吹来的风", "杂货铺的晴雨表", "海鸥借走了帽子", "短暂的太阳雨", "岛屿睡着以后"],
  },
  {
    id: "t-05",
    title: "森林来信",
    subtitle: "树洞里的旧地图",
    author: "南川望",
    palette: ["#557254", "#c6a75f", "#efe0bb"],
    chapters: ["树洞里的旧地图", "苔藓写下的方向", "会搬家的小木屋", "二十年前的脚印", "寄给未来的信", "森林记得答案"],
  },
];

const widthLabels: Array<{ id: ReaderWidth; label: string }> = [
  { id: "compact", label: "窄" },
  { id: "standard", label: "标准" },
  { id: "wide", label: "宽" },
];

const widthValues: Record<ReaderWidth, string> = {
  compact: "680px",
  standard: "840px",
  wide: "1040px",
};

const pageDialogues = [
  ["今晚的月亮，像一枚忘记盖章的邮票。", "这封信……没有地址？"],
  ["只要沿着最亮的那条路走。", "可是，路会在天亮前消失。"],
  ["邮差从不拆开别人的信。", "但他会记住每一个等待的眼神。"],
  ["山脚的灯亮了三次。", "那就是收件人的暗号。"],
];

function ReaderArtwork({ page, chapter, palette }: { page: number; chapter: string; palette: ReaderBook["palette"] }) {
  const style = {
    "--page-a": palette[0],
    "--page-b": palette[1],
    "--page-c": palette[2],
  } as CSSProperties;

  if (page === 0) {
    return (
      <article className="reader-comic-page is-title-page" style={style} data-reader-page="1" aria-label="漫画第 1 页">
        <div className="reader-title-moon"><span>☾</span></div>
        <p>CHAPTER PREVIEW</p>
        <h2>{chapter}</h2>
        <small>这是阅读器版式示例，之后可替换为真实漫画图片。</small>
        <footer><span>奇想书桌 · 漫画剧场</span><b>01</b></footer>
      </article>
    );
  }

  if (page === 5) {
    return (
      <article className="reader-comic-page is-ending-page" style={style} data-reader-page="6" aria-label="漫画第 6 页">
        <div className="reader-ending-mark">未完</div>
        <p>TO BE CONTINUED</p>
        <small>翻到下一章，继续这段旅程。</small>
        <footer><span>{chapter}</span><b>06</b></footer>
      </article>
    );
  }

  const dialogue = pageDialogues[(page - 1) % pageDialogues.length];
  return (
    <article className={`reader-comic-page reader-layout-${page}`} style={style} data-reader-page={page + 1} aria-label={`漫画第 ${page + 1} 页`}>
      <header><span>MOONLIGHT DELIVERY</span><b>{String(page + 1).padStart(2, "0")}</b></header>
      <div className="reader-panel is-landscape">
        <i className="reader-sky-moon">☾</i>
        <span className="reader-roofline" />
        <p className="reader-narration">夜色落到山顶时，邮局的门自己开了。</p>
      </div>
      <div className="reader-panel-row">
        <div className="reader-panel is-character">
          <span className="reader-cat-silhouette"><i /><b /></span>
          <p className="reader-dialogue">{dialogue[0]}</p>
        </div>
        <div className="reader-panel is-letter">
          <span className="reader-letter">✦</span>
          <p className="reader-dialogue is-reply">{dialogue[1]}</p>
        </div>
      </div>
      <div className="reader-panel is-road">
        <span className="reader-road" />
        <p className="reader-sound">沙 沙</p>
      </div>
      <footer><span>{chapter}</span><b>{String(page + 1).padStart(2, "0")}</b></footer>
    </article>
  );
}

export default function ComicReaderPage() {
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [bookId, setBookId] = useState("t-01");
  const [chapterIndex, setChapterIndex] = useState(0);
  const [readerWidth, setReaderWidth] = useState<ReaderWidth>("standard");
  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState(0);
  const [chapterPanelOpen, setChapterPanelOpen] = useState(false);

  const book = useMemo(() => readerBooks.find((item) => item.id === bookId) ?? readerBooks[0], [bookId]);
  const safeChapterIndex = Math.min(chapterIndex, book.chapters.length - 1);
  const chapterTitle = book.chapters[safeChapterIndex];
  const pageStyle = { "--reader-width": widthValues[readerWidth] } as CSSProperties;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedBook = params.get("book");
    const requestedChapter = Number(params.get("chapter") ?? "1") - 1;
    if (requestedBook && readerBooks.some((item) => item.id === requestedBook)) setBookId(requestedBook);
    if (Number.isFinite(requestedChapter) && requestedChapter >= 0) setChapterIndex(requestedChapter);

    const savedTheme = window.localStorage.getItem("creative-desk-theme");
    if (savedTheme === "day" || savedTheme === "night") setTheme(savedTheme);
    const savedWidth = window.localStorage.getItem("comic-reader-width");
    if (savedWidth === "compact" || savedWidth === "standard" || savedWidth === "wide") setReaderWidth(savedWidth);
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable > 0 ? Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100))) : 0;
      setProgress(nextProgress);
      window.localStorage.setItem(`comic-progress-${book.id}-${safeChapterIndex}`, String(nextProgress));
      window.localStorage.setItem(`comic-current-chapter-${book.id}`, String(safeChapterIndex));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, [book.id, safeChapterIndex]);

  useEffect(() => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>("[data-reader-page]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrentPage(Number((visible.target as HTMLElement).dataset.readerPage ?? "1"));
    }, { threshold: [0.28, 0.5, 0.72] });
    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [safeChapterIndex]);

  const selectChapter = useCallback((nextIndex: number) => {
    const clamped = Math.min(Math.max(nextIndex, 0), book.chapters.length - 1);
    setChapterIndex(clamped);
    setCurrentPage(1);
    setChapterPanelOpen(false);
    const params = new URLSearchParams(window.location.search);
    params.set("book", book.id);
    params.set("chapter", String(clamped + 1));
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [book.chapters.length, book.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("button, a, input, select, textarea")) return;
      if (event.key === "ArrowLeft") selectChapter(safeChapterIndex - 1);
      if (event.key === "ArrowRight") selectChapter(safeChapterIndex + 1);
      if (event.key === "Escape") setChapterPanelOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeChapterIndex, selectChapter]);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "day" ? "night" : "day";
      window.localStorage.setItem("creative-desk-theme", next);
      return next;
    });
  };

  const changeWidth = (width: ReaderWidth) => {
    setReaderWidth(width);
    window.localStorage.setItem("comic-reader-width", width);
  };

  return (
    <main className="comic-reader-page" data-theme={theme} style={pageStyle}>
      <div className="reader-progress-line" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <header className="reader-header">
        <a className="reader-back" href="/comics" aria-label="返回漫画书架"><span>←</span><b>返回书架</b></a>
        <button className="reader-chapter-toggle" type="button" onClick={() => setChapterPanelOpen((open) => !open)} aria-expanded={chapterPanelOpen}>
          <span>{String(safeChapterIndex + 1).padStart(2, "0")}</span>
          <strong>{book.title}<small>第 {safeChapterIndex + 1} 话 · {chapterTitle}</small></strong>
          <i aria-hidden="true">⌄</i>
        </button>
        <div className="reader-header-tools">
          <div className="reader-width-control" aria-label="页面宽度">
            {widthLabels.map((item) => <button type="button" key={item.id} className={readerWidth === item.id ? "is-active" : ""} onClick={() => changeWidth(item.id)}>{item.label}</button>)}
          </div>
          <span className="reader-page-count">{currentPage} / 6</span>
          <button className="reader-theme-toggle" type="button" onClick={toggleTheme} aria-label={`切换到${theme === "day" ? "夜间" : "日间"}模式`}>
            {theme === "day" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <aside className={`reader-chapters${chapterPanelOpen ? " is-open" : ""}`} aria-label="章节目录">
        <div className="reader-book-card" style={{ "--book-a": book.palette[0], "--book-b": book.palette[1], "--book-c": book.palette[2] } as CSSProperties}>
          <span>ONLINE READER</span><strong>{book.title}</strong><i>☾</i><small>{book.author}</small>
        </div>
        <div className="reader-chapters-heading"><span>CONTENTS</span><strong>章节目录</strong></div>
        <nav>
          {book.chapters.map((chapter, index) => (
            <button type="button" key={chapter} className={index === safeChapterIndex ? "is-active" : ""} onClick={() => selectChapter(index)} aria-current={index === safeChapterIndex ? "page" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{chapter}</strong>{index === safeChapterIndex && <i>正在阅读</i>}
            </button>
          ))}
        </nav>
        <p>阅读进度仅保存在当前设备，不提供原图下载。</p>
      </aside>
      {chapterPanelOpen && <button className="reader-chapter-scrim" type="button" onClick={() => setChapterPanelOpen(false)} aria-label="关闭章节目录" />}

      <section className="reader-content">
        <header className="reader-chapter-heading">
          <p>CHAPTER {String(safeChapterIndex + 1).padStart(2, "0")}</p>
          <h1>{chapterTitle}</h1>
          <span>{book.title} · {book.subtitle}</span>
          <small>向下滚动阅读</small>
        </header>

        <div className="reader-pages" aria-label={`${book.title}第 ${safeChapterIndex + 1} 话漫画内容`}>
          {Array.from({ length: 6 }, (_, page) => <ReaderArtwork key={`${safeChapterIndex}-${page}`} page={page} chapter={chapterTitle} palette={book.palette} />)}
        </div>

        <nav className="reader-chapter-nav" aria-label="章节切换">
          <button type="button" disabled={safeChapterIndex === 0} onClick={() => selectChapter(safeChapterIndex - 1)}><span>← PREVIOUS</span><strong>{safeChapterIndex > 0 ? book.chapters[safeChapterIndex - 1] : "已经是第一章"}</strong></button>
          <div><span>本章结束</span><b>{safeChapterIndex + 1} / {book.chapters.length}</b></div>
          <button type="button" disabled={safeChapterIndex === book.chapters.length - 1} onClick={() => selectChapter(safeChapterIndex + 1)}><span>NEXT →</span><strong>{safeChapterIndex < book.chapters.length - 1 ? book.chapters[safeChapterIndex + 1] : "已经是最后一章"}</strong></button>
        </nav>
      </section>
    </main>
  );
}
