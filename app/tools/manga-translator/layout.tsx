import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "漫画文字翻译实验室｜奇想书桌",
  description: "上传漫画图片，自动或手动框选文字区域，识别、翻译并逐条编辑。",
};

export default function MangaTranslatorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
