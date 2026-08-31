"use client";

import type { ReactNode } from "react";

type HeaderTheme = "day" | "night";

const mainNavItems = [
  { index: "00", label: "首页", href: "/" },
  { index: "01", label: "漫画", href: "/comics" },
  { index: "02", label: "笔记", href: "/notes" },
  { index: "03", label: "工具", href: "/tools/manga-translator" },
  { index: "04", label: "作品", href: "/works" },
  { index: "05", label: "关于我", href: "/about" },
] as const;

function HeaderBrand({ subtitle, onActivate }: { subtitle: string; onActivate?: () => void }) {
  const content = (
    <>
      <span className="shared-header-logo" aria-hidden="true"><img src="/brand/logo.png" alt="" /></span>
      <span className="shared-header-brand-copy"><strong>PL-HOME</strong><small>{subtitle}</small></span>
    </>
  );

  return onActivate ? (
    <button className="shared-header-brand" type="button" onClick={onActivate} aria-label="返回首页场景">{content}</button>
  ) : (
    <a className="shared-header-brand" href="/" aria-label="返回奇想书桌首页">{content}</a>
  );
}

function MainNavigation({ activeHref }: { activeHref: string }) {
  return (
    <nav className="shared-main-nav" aria-label="网站主菜单">
      {mainNavItems.map((item) => (
        <a key={item.label} href={item.href} className={item.href === activeHref ? "is-active" : ""} aria-current={item.href === activeHref ? "page" : undefined}>
          <span>{item.index}</span>{item.label}
        </a>
      ))}
    </nav>
  );
}

function ThemeControl({ theme, onToggle }: { theme: HeaderTheme; onToggle: () => void }) {
  return (
    <button className="shared-theme-toggle" type="button" onClick={onToggle} aria-pressed={theme === "night"} aria-label={`切换到${theme === "day" ? "夜间" : "日间"}模式`}>
      <span aria-hidden="true">{theme === "day" ? "☀" : "☾"}</span><strong>{theme === "day" ? "日间" : "夜间"}</strong>
    </button>
  );
}

export function ContentHeader({
  subtitle,
  activeHref,
  theme,
  onToggleTheme,
}: {
  subtitle: string;
  activeHref: string;
  theme: HeaderTheme;
  onToggleTheme: () => void;
}) {
  return (
    <header className="shared-site-header shared-content-header">
      <HeaderBrand subtitle={subtitle} />
      <div className="shared-header-actions">
        <MainNavigation activeHref={activeHref} />
        <ThemeControl theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}

export function SceneHeader({
  subtitle,
  theme,
  onToggleTheme,
  onBrandActivate,
  activeHref,
  navigation,
  leadingAction,
  variant,
}: {
  subtitle: string;
  theme: HeaderTheme;
  onToggleTheme: () => void;
  onBrandActivate?: () => void;
  activeHref?: string;
  navigation?: ReactNode;
  leadingAction?: ReactNode;
  variant: "home" | "about";
}) {
  return (
    <header className={`shared-site-header shared-scene-header is-${variant}`}>
      <HeaderBrand subtitle={subtitle} onActivate={onBrandActivate} />
      <div className="shared-header-actions">
        {leadingAction}
        {activeHref ? <MainNavigation activeHref={activeHref} /> : navigation}
        <ThemeControl theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}
