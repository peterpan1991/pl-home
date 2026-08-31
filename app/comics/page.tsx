"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ContentHeader } from "../components/SiteHeaders";
import { sitePath } from "../lib/sitePath";

type ThemeMode = "day" | "night";
type ShelfId = "theater" | "collection";

type ComicBook = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  volume: string;
  status: string;
  description: string;
  tags: string[];
  progress: number;
  palette: [string, string, string];
  symbol: string;
};

const shelves: Array<{ id: ShelfId; index: string; label: string; english: string; mark: string; description: string }> = [
  { id: "theater", index: "01", label: "漫画剧场", english: "COMIC THEATER", mark: "剧", description: "已经整理完成、适合在线连续阅读的故事。按章节观看，阅读进度只保存在本机。" },
  { id: "collection", index: "02", label: "漫画收藏", english: "MY COLLECTION", mark: "藏", description: "喜欢的漫画与画集索引。这里记录版本、作者和阅读笔记，不提供原文件下载。" },
];

const books: Record<ShelfId, ComicBook[]> = {
  theater: [
    { id: "t-01", title: "月光邮差", subtitle: "写给夜晚的七封信", author: "森川遥", volume: "VOL. 01", status: "全 7 话", description: "住在山顶的猫邮差，只在月亮升起后替人送出没有地址的信。", tags: ["奇幻", "短篇", "已完结"], progress: 68, palette: ["#38566d", "#e4b66d", "#f2ddbd"], symbol: "☾" },
    { id: "t-02", title: "云上车站", subtitle: "下一班列车去往春天", author: "青木庭", volume: "VOL. 02", status: "连载至 12 话", description: "一座随云移动的车站，以及错过末班车后仍然等待的人。", tags: ["治愈", "旅行", "连载中"], progress: 35, palette: ["#5f8d9a", "#efc285", "#f4e3cb"], symbol: "↟" },
    { id: "t-03", title: "深夜便利店", subtitle: "凌晨三点的客人", author: "山下由纪", volume: "VOL. 01", status: "全 10 话", description: "城市睡着以后，一家小店开始接待来自不同时间的客人。", tags: ["都市", "单元剧", "已完结"], progress: 100, palette: ["#313f58", "#d56f51", "#f0cf94"], symbol: "✦" },
    { id: "t-04", title: "小岛天气", subtitle: "今天也有风经过", author: "白石丘", volume: "VOL. 03", status: "连载至 18 话", description: "关于海边小岛、杂货铺和四季里那些看起来很小的事件。", tags: ["日常", "海边", "连载中"], progress: 12, palette: ["#4a8790", "#eaa66e", "#f6e6c9"], symbol: "≈" },
    { id: "t-05", title: "森林来信", subtitle: "树洞里的旧地图", author: "南川望", volume: "VOL. 01", status: "全 6 话", description: "三个孩子在森林里找到一封二十年前寄给自己的信。", tags: ["冒险", "童话", "已完结"], progress: 0, palette: ["#557254", "#c6a75f", "#efe0bb"], symbol: "⌁" },
  ],
  collection: [
    { id: "c-01", title: "星砂图鉴", subtitle: "收藏版画集", author: "北岛澪", volume: "ART BOOK", status: "2024 收藏", description: "以夜空、玻璃和海水为主题的短篇画集，收藏它的配色与分镜。", tags: ["画集", "收藏版", "配色"], progress: 0, palette: ["#4b4d77", "#db9d75", "#eadab7"], symbol: "✧" },
    { id: "c-02", title: "猫町散步", subtitle: "完全版 上卷", author: "井上圆", volume: "COMPLETE 01", status: "已读", description: "一座只有猫知道捷径的小镇，页面里藏着大量值得反复看的细节。", tags: ["日常", "完全版", "已读"], progress: 100, palette: ["#9a684e", "#d99b5e", "#f1dfbd"], symbol: "⌂" },
    { id: "c-03", title: "雨声博物馆", subtitle: "典藏版", author: "松岛灯", volume: "SPECIAL", status: "待读", description: "把不同城市的雨画成房间，是一本节奏很安静的实验漫画。", tags: ["实验漫画", "典藏版", "待读"], progress: 0, palette: ["#48687a", "#84a6a8", "#e7d6bd"], symbol: "⋮" },
    { id: "c-04", title: "远方食堂", subtitle: "旅行合订本", author: "高桥元", volume: "OMNIBUS", status: "阅读中", description: "一道料理连接一个地方，用食物讲述旅行中短暂停留的关系。", tags: ["旅行", "美食", "合订本"], progress: 42, palette: ["#8b503d", "#e4a755", "#f4e1bd"], symbol: "◌" },
    { id: "c-05", title: "植物通信", subtitle: "短篇作品集", author: "叶山秋", volume: "STORIES", status: "已读", description: "植物开始发送人类无法翻译的消息以后，城市发生的五个故事。", tags: ["科幻", "短篇集", "已读"], progress: 100, palette: ["#426958", "#9fad68", "#ead8ac"], symbol: "❋" },
  ],
};

function BookCover({ book, active }: { book: ComicBook; active: boolean }) {
  const style = { "--cover-a": book.palette[0], "--cover-b": book.palette[1], "--cover-c": book.palette[2] } as CSSProperties;
  return (
    <div className={`comic-book-cover${active ? " is-active" : ""}`} style={style}>
      <span className="comic-book-spine"><i>{book.volume}</i></span>
      <div className="comic-cover-face">
        <small>{book.subtitle}</small>
        <strong>{book.title}</strong>
        <div className="comic-cover-art"><span>{book.symbol}</span><i /><b /></div>
        <footer><span>{book.author}</span><em>{book.volume}</em></footer>
      </div>
      <span className="comic-page-edge" />
    </div>
  );
}

export default function ComicsPage() {
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [activeShelf, setActiveShelf] = useState<ShelfId>("theater");
  const [selectedId, setSelectedId] = useState(books.theater[0].id);
  const shelf = shelves.find((item) => item.id === activeShelf) ?? shelves[0];
  const shelfBooks = books[activeShelf];
  const selectedBook = useMemo(() => shelfBooks.find((book) => book.id === selectedId) ?? shelfBooks[0], [selectedId, shelfBooks]);

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

  const changeShelf = (nextShelf: ShelfId) => {
    setActiveShelf(nextShelf);
    setSelectedId(books[nextShelf][0].id);
  };

  return (
    <main className="comics-page" data-theme={theme}>
      <ContentHeader subtitle="ONLINE COMIC SHELF" activeHref="/comics" theme={theme} onToggleTheme={toggleTheme} />

      <nav className="comics-shelf-tabs content-tool-sections" aria-label="漫画子栏目" role="tablist" style={{ "--section-columns": 2 } as CSSProperties}>
        {shelves.map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={activeShelf === item.id} className={activeShelf === item.id ? "is-active" : ""} onClick={() => changeShelf(item.id)}>
            <span>{item.mark}</span>
            <strong><small>{item.index} · {item.english}</small>{item.label}</strong>
            <i>{item.id === activeShelf ? "当前" : "查看"}</i>
          </button>
        ))}
      </nav>

      <section className="comics-shelf">
        <header className="comics-shelf-heading">
          <div><p>{shelf.english}</p><h2>{shelf.label}</h2></div>
          <p>{shelf.description}</p>
          <span>{String(shelfBooks.length).padStart(2, "0")} BOOKS</span>
        </header>

        <div className="comics-library-layout">
          <div className="comics-book-grid" role="list" aria-label={`${shelf.label}书籍`}>
            {shelfBooks.map((book) => (
              <button key={book.id} type="button" role="listitem" className={selectedBook.id === book.id ? "is-selected" : ""} onClick={() => setSelectedId(book.id)}>
                <BookCover book={book} active={selectedBook.id === book.id} />
                <span className="comic-book-caption"><strong>{book.title}</strong><small>{book.status}</small></span>
              </button>
            ))}
          </div>

          <aside className="comic-book-detail" key={selectedBook.id}>
            <div className="comic-detail-index"><span>SELECTED BOOK</span><b>{selectedBook.volume}</b></div>
            <h2>{selectedBook.title}</h2>
            <p>{selectedBook.description}</p>
            <div className="comic-detail-tags">{selectedBook.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <dl>
              <div><dt>作者</dt><dd>{selectedBook.author}</dd></div>
              <div><dt>状态</dt><dd>{selectedBook.status}</dd></div>
            </dl>
            {activeShelf === "theater" ? (
              <div className="comic-reading-progress">
                <div><span>阅读进度</span><b>{selectedBook.progress}%</b></div>
                <i><span style={{ width: `${selectedBook.progress}%` }} /></i>
                <a href={sitePath(`/comics/reader?book=${selectedBook.id}`)}>{selectedBook.progress > 0 ? "继续阅读" : "开始阅读"}<span>→</span></a>
              </div>
            ) : (
              <div className="comic-collection-note"><span>COLLECTION NOTE</span><p>点击后可继续补充版本信息、收藏原因和个人阅读笔记。</p></div>
            )}
          </aside>
        </div>
      </section>

      <footer className="comics-footer"><span>© 2026 奇想书桌</span><span>只在线阅读，不提供原文件下载。</span></footer>
    </main>
  );
}
