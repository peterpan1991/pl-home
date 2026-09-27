import type { Metadata } from "next";
import { WorksContent } from "../works/page";

export const metadata: Metadata = {
  title: "项目｜PL-HOME",
  description: "浏览全栈开发、AI 应用、桌面工具与企业系统项目经验。",
};

export default function ProjectsPage() {
  return <WorksContent initialCategory="projects" />;
}
