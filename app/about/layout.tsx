import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我｜奇想书桌",
  description: "通过一只背着旅行包的三维猫咪，了解创作者的兴趣、技能树与项目作品。",
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
