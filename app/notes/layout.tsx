import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "奇想笔记｜教程、吐槽与百科",
  description: "以沉浸阅读形式整理实践教程、创作吐槽和个人百科词条。",
};

export default function NotesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
