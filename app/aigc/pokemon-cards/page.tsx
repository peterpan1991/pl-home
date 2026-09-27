"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ContentHeader } from "../../components/SiteHeaders";
import { sitePath } from "../../lib/sitePath";
import { useTheme } from "../../lib/useTheme";

const titles = [
  "小木灵", "摔角鹰人", "火箭队的引梦貘人", "火箭队的戴路比", "球球海师", "炭小侍", "蓝鳄", "彷徨幽灵", "超级喷火龙ex", "探探鼠", "哥达鸭", "流氓鳄", "派来朵", "小猫怪", "电击魔兽", "火箭队的催眠貘", "炽焰咆哮虎", "小火马", "鬼斯", "火箭队的超梦ex", "戴欧奇希斯", "小火猴", "雪拉比", "巨翅飞鱼", "落泪兽", "迷你龙", "皮卡丘ex", "鬼斯通", "霹雳球", "妙蛙草", "咩利羊", "火斑喵", "拉鲁拉丝", "火箭队的果然翁", "妙蛙种子", "雪童子", "雷公", "鬼斯通", "双蛋瓦斯", "阿响的熔岩蜗牛", "火恐龙", "阿勃梭鲁", "故勒顿ex",
] as const;

const jpgCards = new Set([13, 18, 22]);
const cards = titles.map((title, index) => {
  const number = index + 1;
  return {
    id: `card-${number}`,
    title,
    image: sitePath(`/pokemonCard/image/${number}.${jpgCards.has(number) ? "jpg" : "png"}`),
    video: sitePath(`/pokemonCard/video/${number}.mp4`),
  };
});

export default function PokemonCardsPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const filmstripRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme, noTransition } = useTheme();
  const activeCard = activeIndex === null ? null : cards[activeIndex];

  const move = (direction: number) => {
    setActiveIndex((current) => current === null ? null : (current + direction + cards.length) % cards.length);
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    filmstripRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  return (
    <main className={`works-page${noTransition ? " no-transition" : ""}`} data-theme={theme} suppressHydrationWarning>
      <ContentHeader subtitle="AIGC · MOTION CARDS" activeHref="/aigc/pokemon-cards" theme={theme} onToggleTheme={toggleTheme} />
      <section className="works-gallery" aria-live="polite">
        <header className="works-gallery-header">
          <div><p>AIGC · MOTION CARDS</p><h2>宝可梦卡牌</h2></div>
          <p>围绕卡牌构图、全息质感与动态反馈制作的个人视觉练习。</p>
          <span>{String(cards.length).padStart(2, "0")} ITEMS</span>
        </header>
        <div className="works-grid" data-category="cards">
          {cards.map((card, index) => (
            <article className="works-item" key={card.id} style={{ "--item-order": index } as CSSProperties}>
              <button className="works-item-trigger" type="button" onClick={() => setActiveIndex(index)} aria-label={`播放${card.title}动态卡牌`}>
                <div className="works-visual works-card-visual">
                  <img className="works-card-cover" src={card.image} alt="" loading="lazy" decoding="async" />
                  <span className="works-card-play" aria-hidden="true">▶</span>
                </div>
                <div className="works-item-meta"><div><h3>{card.title}</h3></div></div>
              </button>
            </article>
          ))}
        </div>
      </section>
      <footer className="works-footer"><span>© 2026 PL-HOME</span><a href={sitePath("/")}>← Back to desk</a></footer>

      {activeCard && activeIndex !== null ? (
        <div className="pokemon-card-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
          <section className="pokemon-card-modal" role="dialog" aria-modal="true" aria-labelledby="pokemon-card-modal-title">
            <header className="pokemon-card-modal-header">
              <div><span>MOTION CARD · {String(activeIndex + 1).padStart(2, "0")}</span><h2 id="pokemon-card-modal-title">{activeCard.title}</h2></div>
              <p>{String(activeIndex + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}</p>
              <button type="button" autoFocus onClick={() => setActiveIndex(null)} aria-label="关闭动态卡牌播放器">×</button>
            </header>
            <div className="pokemon-card-player">
              <button className="pokemon-card-switch is-previous" type="button" onClick={() => move(-1)} aria-label="上一张动态卡牌">←</button>
              <div className="pokemon-card-video-frame" style={{ "--pokemon-card-poster": `url("${activeCard.image}")` } as CSSProperties}>
                <video key={activeCard.video} src={activeCard.video} poster={activeCard.image} autoPlay muted loop playsInline disablePictureInPicture disableRemotePlayback preload="auto" />
              </div>
              <button className="pokemon-card-switch is-next" type="button" onClick={() => move(1)} aria-label="下一张动态卡牌">→</button>
            </div>
            <nav ref={filmstripRef} className="pokemon-card-filmstrip" aria-label="选择动态卡牌">
              {cards.map((card, index) => (
                <button type="button" key={card.id} className={index === activeIndex ? "is-active" : ""} aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)}>
                  <img src={card.image} alt="" loading="lazy" decoding="async" /><span><small>{String(index + 1).padStart(2, "0")}</small>{card.title}</span>
                </button>
              ))}
            </nav>
          </section>
        </div>
      ) : null}
    </main>
  );
}
