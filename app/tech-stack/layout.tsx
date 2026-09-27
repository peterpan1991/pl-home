import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "技术栈｜PL-HOME",
  description: "以游戏角色属性面板的形式展示 AI 应用、全栈开发、客户端与工程交付能力。",
};

export default function TechStackLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
