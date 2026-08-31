import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "作品｜奇想书桌",
  description: "浏览创作者整理的壁纸、插画与宝可梦动态卡牌作品。",
};

export default function WorksLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
