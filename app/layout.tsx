import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pan-creative-island.pl404944148.chatgpt.site";
const socialImageUrl = new URL("og-v2.png", `${siteUrl.replace(/\/$/, "")}/`).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "PL-HOME｜AIGC、项目、手绘与技术栈",
  description: "通过一张极简像素 3D 书桌，探索 AIGC 创作、开发项目、手绘作品、技术栈与创作者档案。",
  icons: {
    icon: `${basePath}/brand/logo.png`,
    apple: `${basePath}/brand/logo.png`,
  },
  openGraph: {
    title: "PL-HOME",
    description: "一张可以用镜头探索的像素创作书桌。",
    images: [{ url: socialImageUrl, width: 1200, height: 630, alt: "PL-HOME的极简体素 3D 场景" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PL-HOME",
    description: "一张可以用镜头探索的像素创作书桌。",
    images: [socialImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("creative-desk-theme");if(t==="day"||t==="night")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
