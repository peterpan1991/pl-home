"use client";

import { useEffect, useMemo, useState } from "react";
import { ContentHeader } from "../components/SiteHeaders";
import { sitePath } from "../lib/sitePath";
import { useTheme } from "../lib/useTheme";

const drawings = [
  "/draw/2012-03-09.jpg", "/draw/2012-03-10-2.jpg", "/draw/2012-03-10.jpg", "/draw/2012-3-11-2.jpg", "/draw/2012-3-11.jpg", "/draw/2013-07-03.jpg", "/draw/2013-07-09.jpg", "/draw/2013-07-22.jpg", "/draw/2014-06-05.jpg", "/draw/2014-3-9.jpg", "/draw/2015-10-8.jpg", "/draw/2015-9-27.jpg", "/draw/2016-1-5.jpg", "/draw/2016-1-9-鼠.jpg", "/draw/2016-6-11-牛.jpg", "/draw/2016-6-26黑帮2.jpg", "/draw/2019-5-2.JPG", "/draw/2019-5-4.JPG", "/draw/2024-2-18.JPG", "/draw/2024-3-24.JPG", "/draw/2024-3-3.JPG", "/draw/2024-4-13.JPG", "/draw/2025-3-8.JPG", "/draw/2025-4-3.JPG", "/draw/2025-7-15.jpg", "/draw/2025-8-14.jpg", "/draw/2025-8-21.jpg", "/draw/2025-9-13.JPG",
] as const;

type BookPage =
  | { kind: "cover" }
  | { kind: "drawing"; image: string; number: number; year: string }
  | { kind: "end" };

const pages: BookPage[] = [
  { kind: "cover" },
  ...drawings.map((image, index) => ({
    kind: "drawing" as const,
    image,
    number: index + 1,
    year: image.match(/\/draw\/(\d{4})/)?.[1] ?? "",
  })),
  { kind: "end" },
];

const totalSpreads = Math.ceil(pages.length / 2);

function DrawingPage({ page, side }: { page?: BookPage; side: "left" | "right" }) {
  if (!page) return <article className={`hand-book-page is-blank is-${side}`} aria-hidden="true" />;

  if (page.kind === "cover") {
    return (
      <article className={`hand-book-page hand-book-cover is-${side}`}>
        <div className="hand-book-cover-mark">PL-HOME · DRAWING ARCHIVE</div>
        <div>
          <p>2012 — 2025</p>
          <h1>手绘画册</h1>
          <span>一年心血来潮画几张...</span>
        </div>
        <small>OPEN THE BOOK →</small>
      </article>
    );
  }

  if (page.kind === "end") {
    return (
      <article className={`hand-book-page hand-book-end is-${side}`}>
        <span>THE END</span>
        <p>画册会继续变厚。</p>
      </article>
    );
  }

  return (
    <article className={`hand-book-page hand-book-art is-${side}`}>
      <figure>
        <img src={sitePath(page.image)} alt={`手绘作品 ${page.number}`} decoding="async" />
        <figcaption>
          <span>DRAWING {String(page.number).padStart(2, "0")}</span>
          <strong>{page.year}</strong>
        </figcaption>
      </figure>
      <small>{page.number}</small>
    </article>
  );
}

type PageTurn = {
  direction: "next" | "previous";
  from: number;
  to: number;
};

function TurningLeaf({ turn, onFinish }: { turn: PageTurn; onFinish: () => void }) {
  const isNext = turn.direction === "next";
  const frontPage = isNext ? pages[turn.from + 1] : pages[turn.from];
  const backPage = isNext ? pages[turn.to] : pages[turn.to + 1];

  return (
    <div className={`hand-book-leaf is-${turn.direction}`} onAnimationEnd={onFinish} aria-hidden="true">
      <div className="hand-book-leaf-face is-front">
        <DrawingPage page={frontPage} side={isNext ? "right" : "left"} />
      </div>
      <div className="hand-book-leaf-face is-back">
        <DrawingPage page={backPage} side={isNext ? "left" : "right"} />
      </div>
    </div>
  );
}

export default function DrawingBookPage() {
  const [pageStart, setPageStart] = useState(0);
  const [compact, setCompact] = useState(false);
  const [compactTurn, setCompactTurn] = useState<"next" | "previous">("next");
  const [turning, setTurning] = useState<PageTurn | null>(null);
  const { theme, toggleTheme, noTransition } = useTheme();
  const pageStep = compact ? 1 : 2;
  const maxPageStart = compact ? pages.length - 1 : pages.length - 2;
  const currentView = compact ? pageStart + 1 : Math.floor(pageStart / 2) + 1;
  const totalViews = compact ? pages.length : totalSpreads;
  const [leftPage, rightPage] = useMemo(() => {
    if (!turning || compact) return [pages[pageStart], compact ? undefined : pages[pageStart + 1]];

    return turning.direction === "next"
      ? [pages[turning.from], pages[turning.to + 1]]
      : [pages[turning.to], pages[turning.from + 1]];
  }, [compact, pageStart, turning]);

  const changePage = (nextPageStart: number) => {
    const bounded = Math.max(0, Math.min(maxPageStart, nextPageStart));
    if (bounded === pageStart || turning) return;
    const direction = bounded > pageStart ? "next" : "previous";

    if (compact || Math.abs(bounded - pageStart) !== 2) {
      setCompactTurn(direction);
      setPageStart(bounded);
      return;
    }

    setTurning({ direction, from: pageStart, to: bounded });
    setPageStart(bounded);
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const updateCompact = () => {
      setCompact(media.matches);
      setTurning(null);
      setPageStart((current) => media.matches ? current : Math.floor(current / 2) * 2);
    };
    updateCompact();
    media.addEventListener("change", updateCompact);
    return () => media.removeEventListener("change", updateCompact);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") changePage(pageStart - pageStep);
      if (event.key === "ArrowRight") changePage(pageStart + pageStep);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pageStart, pageStep, turning]);

  return (
    <main className={`hand-book-page-shell${noTransition ? " no-transition" : ""}`} data-theme={theme} suppressHydrationWarning>
      <ContentHeader subtitle="DRAWING BOOK" activeHref="/drawing" theme={theme} onToggleTheme={toggleTheme} />

      <section className="hand-book-reader" aria-label="手绘翻页画册">
        <header className="hand-book-reader-head">
          <div><span>DRAWING ARCHIVE</span><h2>手绘画册</h2></div>
          <p>使用 ← → 键或下方按钮翻页</p>
          <strong>{String(currentView).padStart(2, "0")} / {String(totalViews).padStart(2, "0")}</strong>
        </header>

        <div className={`hand-book-stage${compact ? ` is-compact-${compactTurn}` : ""}${turning ? ` is-turning is-${turning.direction}` : ""}`}>
          <div className="hand-book-shadow" aria-hidden="true" />
          <div className="hand-book-spread" key={compact ? `page-${pageStart}` : "spread"}>
            <DrawingPage page={leftPage} side="left" />
            <DrawingPage page={rightPage} side="right" />
            {turning && !compact ? <TurningLeaf turn={turning} onFinish={() => setTurning(null)} /> : null}
          </div>
        </div>

        <div className="hand-book-controls">
          <button type="button" onClick={() => changePage(pageStart - pageStep)} disabled={pageStart === 0 || Boolean(turning)} aria-label="上一页">← <span>上一页</span></button>
          <p>第 {pageStart + 1}{compact ? "" : ` — ${Math.min(pageStart + 2, pages.length)}`} 页</p>
          <button type="button" onClick={() => changePage(pageStart + pageStep)} disabled={pageStart === maxPageStart || Boolean(turning)} aria-label="下一页"><span>下一页</span> →</button>
        </div>
      </section>

      <nav className="hand-book-thumbnails" aria-label="选择手绘作品">
        {drawings.map((image, index) => {
          const pageIndex = index + 1;
          const targetPageStart = compact ? pageIndex : Math.floor(pageIndex / 2) * 2;
          const isActive = compact ? pageIndex === pageStart : targetPageStart === pageStart;
          return (
            <button key={image} type="button" onClick={() => changePage(targetPageStart)} disabled={Boolean(turning)} className={isActive ? "is-active" : ""} aria-current={isActive ? "page" : undefined} aria-label={`跳转到手绘作品 ${index + 1}`}>
              <img src={sitePath(image)} alt="" loading="lazy" decoding="async" />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </nav>

      <footer className="hand-book-footer"><span>© 2026 PL-HOME</span><p>收录 {drawings.length} 幅手绘作品</p><a href={sitePath("/")}>← Back to desk</a></footer>
    </main>
  );
}
