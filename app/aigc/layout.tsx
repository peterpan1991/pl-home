import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AIGC｜PL-HOME",
  description: "AI 绘画与宝可梦动态卡牌创作实验。",
};

export default function AigcLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
