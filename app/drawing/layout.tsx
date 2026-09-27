import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "手绘画册｜PL-HOME",
  description: "以翻页画册的形式浏览角色、场景与日常观察的手绘作品。",
};

export default function DrawingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
