import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3003";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title: "奇想书桌｜作品、漫画、工具与教程",
    description: "通过一张极简像素 3D 书桌，探索作品、漫画、工具、教程与创作者档案。",
    icons: {
      icon: "/brand/logo.png",
      apple: "/brand/logo.png",
    },
    openGraph: {
      title: "奇想书桌",
      description: "一张可以用镜头探索的像素创作书桌。",
      images: [{ url: "/og-v2.png", width: 1200, height: 630, alt: "奇想书桌的极简体素 3D 场景" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "奇想书桌",
      description: "一张可以用镜头探索的像素创作书桌。",
      images: ["/og-v2.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
