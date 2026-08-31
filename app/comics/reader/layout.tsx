import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "章节阅读器｜奇想书桌",
  description: "在线纵向阅读漫画章节，记录本机阅读进度，不提供原图下载。",
};

export default function ComicReaderLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
