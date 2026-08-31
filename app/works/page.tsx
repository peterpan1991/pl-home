"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ContentHeader } from "../components/SiteHeaders";
import { sitePath } from "../lib/sitePath";

type ThemeMode = "day" | "night";
type WorkCategory = "wallpapers" | "illustrations" | "cards";

type WorkItem = {
  id: string;
  title: string;
  note: string;
  year: string;
  palette: [string, string, string];
  variant: number;
  image?: string;
  video?: string;
};

const categories: Array<{
  id: WorkCategory;
  index: string;
  label: string;
  english: string;
  mark: string;
  description: string;
}> = [
  
  {
    id: "illustrations",
    index: "01",
    label: "手绘",
    english: "ILLUSTRATIONS",
    mark: "画",
    description: "角色、场景与日常观察，把脑海里的小故事留在画面里。",
  },
  {
    id: "wallpapers",
    index: "02",
    label: "AI绘画(壁纸·插画)",
    english: "WALLPAPERS",
    mark: "景",
    description: "为桌面与手机整理的安静画面，保留适合长时间观看的留白和色彩。",
  },
  {
    id: "cards",
    index: "03",
    label: "宝可梦动态卡牌",
    english: "MOTION CARDS",
    mark: "卡",
    description: "围绕卡牌构图、全息质感与动态反馈制作的个人视觉练习。",
  },
];

const collections: Record<WorkCategory, WorkItem[]> = {
  wallpapers: [
    { id: "w-01", title: "暮色航线", note: "桌面壁纸 · 16:10", year: "2026", palette: ["#536c78", "#df9a72", "#f4d8b4"], variant: 1 },
    { id: "w-02", title: "云上车站", note: "桌面壁纸 · 16:10", year: "2026", palette: ["#789aa7", "#efd5aa", "#cf7657"], variant: 2 },
    { id: "w-03", title: "森林来信", note: "移动端壁纸 · 9:16", year: "2025", palette: ["#526f58", "#b7bd82", "#f0c68f"], variant: 3 },
    { id: "w-04", title: "雨后窗口", note: "桌面壁纸 · 16:10", year: "2025", palette: ["#55718a", "#9bb7bd", "#e7bb8d"], variant: 4 },
  ],
  illustrations: [
    { id: "i-01", title: "背包与远方", note: "角色插画", year: "2026", palette: ["#d7794f", "#eeb77d", "#58705b"], variant: 1 },
    { id: "i-02", title: "深夜书店", note: "场景插画", year: "2026", palette: ["#2d4556", "#d99063", "#f0d7a9"], variant: 2 },
    { id: "i-03", title: "把春天装进口袋", note: "主题插画", year: "2025", palette: ["#87a36d", "#eabf78", "#d96e61"], variant: 3 },
    { id: "i-04", title: "小镇午后", note: "场景插画", year: "2025", palette: ["#5d8d94", "#f0c791", "#b65f4d"], variant: 4 },
    { id: "i-05", title: "猫与小小宇宙", note: "角色插画", year: "2025", palette: ["#6f668c", "#e19c6b", "#f4dfbd"], variant: 5 },
    { id: "i-06", title: "夏日收集册", note: "主题插画", year: "2024", palette: ["#4e8790", "#f1b966", "#db7256"], variant: 6 },
  ],
  cards: [
    { id: "c-01", title: "小木灵", note: "动态卡牌 · 01", year: "2026", palette: ["#71883f", "#b8cf58", "#263f42"], variant: 1, image: sitePath("/pokemonCard/image/1.jpg"), video: sitePath("/pokemonCard/video/1.mp4") },
    { id: "c-02", title: "摔角鹰人", note: "动态卡牌 · 02", year: "2026", palette: ["#e19a24", "#f2c448", "#ad382e"], variant: 2, image: sitePath("/pokemonCard/image/2.jpg"), video: sitePath("/pokemonCard/video/2.mp4") },
  ],
};

function WorkVisual({ category, item }: { category: WorkCategory; item: WorkItem }) {
  const style = {
    "--work-a": item.palette[0],
    "--work-b": item.palette[1],
    "--work-c": item.palette[2],
  } as CSSProperties;

  if (category === "cards") {
    return (
      <div className={`works-visual works-card-visual works-art-${item.variant}`} style={style}>
        {item.image ? <img className="works-card-cover" src={item.image} alt="" /> : null}
        <span className="works-card-play" aria-hidden="true">▶</span>
      </div>
    );
  }

  return (
    <div className={`works-visual works-${category}-visual works-art-${item.variant}`} style={style}>
      <span className="works-art-sun" />
      <span className="works-art-land" />
      <span className="works-art-window" />
      <span className="works-art-character"><i /></span>
      <small>{category === "wallpapers" ? "QUIET LANDSCAPE" : "A SMALL STORY"}</small>
    </div>
  );
}

export default function WorksPage() {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>("illustrations");
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("day");
  const category = categories.find((item) => item.id === activeCategory) ?? categories[0];
  const items = collections[activeCategory];
  const cardItems = collections.cards;
  const activeCard = activeCardIndex === null ? null : cardItems[activeCardIndex];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("creative-desk-theme");
    if (savedTheme === "day" || savedTheme === "night") setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "day" ? "night" : "day";
      window.localStorage.setItem("creative-desk-theme", next);
      return next;
    });
  };

  useEffect(() => {
    if (activeCardIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveCardIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveCardIndex((current) => current === null ? null : (current - 1 + cardItems.length) % cardItems.length);
      }
      if (event.key === "ArrowRight") {
        setActiveCardIndex((current) => current === null ? null : (current + 1) % cardItems.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCardIndex, cardItems.length]);

  const showPreviousCard = () => {
    setActiveCardIndex((current) => current === null ? null : (current - 1 + cardItems.length) % cardItems.length);
  };

  const showNextCard = () => {
    setActiveCardIndex((current) => current === null ? null : (current + 1) % cardItems.length);
  };

  return (
    <main className="works-page" data-theme={theme}>
      <ContentHeader subtitle="SELECTED WORKS" activeHref="/works" theme={theme} onToggleTheme={toggleTheme} />

      <nav className="works-category-tabs content-tool-sections" aria-label="作品子栏目" role="tablist" style={{ "--section-columns": 3 } as CSSProperties}>
        {categories.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            aria-selected={item.id === activeCategory}
            className={item.id === activeCategory ? "is-active" : ""}
            onClick={() => { setActiveCategory(item.id); setActiveCardIndex(null); }}
          >
            <span>{item.mark}</span>
            <strong><small>{item.index} · {item.english}</small>{item.label}</strong>
            <i>{item.id === activeCategory ? "当前" : "查看"}</i>
          </button>
        ))}
      </nav>

      <section className="works-gallery" aria-live="polite">
        <header className="works-gallery-header">
          <div><p>{category.english}</p><h2>{category.label}</h2></div>
          <p>{category.description}</p>
          <span>{String(items.length).padStart(2, "0")} ITEMS</span>
        </header>

        <div className="works-grid" data-category={activeCategory}>
          {items.map((item, index) => (
            <article className="works-item" key={item.id} style={{ "--item-order": index } as CSSProperties}>
              {activeCategory === "cards" ? (
                <button className="works-item-trigger" type="button" onClick={() => setActiveCardIndex(index)} aria-label={`播放${item.title}动态卡牌`}>
                  <WorkVisual category={activeCategory} item={item} />
                  <div className="works-item-meta">
                    <div><span>{item.note}</span><h3>{item.title}</h3></div>
                    <small>点击播放</small>
                  </div>
                </button>
              ) : (
                <>
                  <WorkVisual category={activeCategory} item={item} />
                  <div className="works-item-meta">
                    <div><span>{item.note}</span><h3>{item.title}</h3></div>
                    <small>{item.year}</small>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="works-process-note">
        <p>ABOUT THE ARCHIVE</p>
        <h2>不只展示成品，也会留下创作过程。</h2>
        <span>后续每件作品可以补充草图、配色尝试、制作工具和完整尺寸，让画廊既好看，也能被真正读懂。</span>
      </section>

      <footer className="works-footer">
        <span>© 2026 奇想书桌</span>
        <a href={sitePath("/")}>← 回到书桌</a>
      </footer>

      {activeCard && activeCardIndex !== null ? (
        <div className="pokemon-card-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveCardIndex(null); }}>
          <section className="pokemon-card-modal" role="dialog" aria-modal="true" aria-labelledby="pokemon-card-modal-title">
            <header className="pokemon-card-modal-header">
              <div>
                <span>MOTION CARD · {String(activeCardIndex + 1).padStart(2, "0")}</span>
                <h2 id="pokemon-card-modal-title">{activeCard.title}</h2>
              </div>
              <p>{String(activeCardIndex + 1).padStart(2, "0")} / {String(cardItems.length).padStart(2, "0")}</p>
              <button type="button" autoFocus onClick={() => setActiveCardIndex(null)} aria-label="关闭动态卡牌播放器">×</button>
            </header>

            <div className="pokemon-card-player">
              <button className="pokemon-card-switch is-previous" type="button" onClick={showPreviousCard} aria-label="上一张动态卡牌">←</button>
              <div
                className="pokemon-card-video-frame"
                style={{ "--pokemon-card-poster": `url("${activeCard.image}")` } as CSSProperties}
              >
                <video
                  key={activeCard.video}
                  src={activeCard.video}
                  poster={activeCard.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  disableRemotePlayback
                  preload="auto"
                />
              </div>
              <button className="pokemon-card-switch is-next" type="button" onClick={showNextCard} aria-label="下一张动态卡牌">→</button>
            </div>

            <nav className="pokemon-card-filmstrip" aria-label="选择动态卡牌">
              {cardItems.map((card, index) => (
                <button
                  type="button"
                  key={card.id}
                  className={index === activeCardIndex ? "is-active" : ""}
                  aria-current={index === activeCardIndex ? "true" : undefined}
                  onClick={() => setActiveCardIndex(index)}
                >
                  <img src={card.image} alt="" />
                  <span><small>{String(index + 1).padStart(2, "0")}</small>{card.title}</span>
                </button>
              ))}
            </nav>
          </section>
        </div>
      ) : null}
    </main>
  );
}
