import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "漫画书架｜奇想书桌",
  description: "以书籍封面浏览漫画剧场与个人漫画收藏。",
};

export default function ComicsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
