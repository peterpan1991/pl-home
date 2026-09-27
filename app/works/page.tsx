"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ContentHeader } from "../components/SiteHeaders";
import { sitePath } from "../lib/sitePath";
import { useTheme } from "../lib/useTheme";

export type WorkCategory = "projects" | "wallpapers" | "illustrations";

type WorkItem = {
  id: string;
  title: string;
  note: string;
  year: string;
  palette: [string, string, string];
  variant: number;
  image?: string;
};

type ProjectItem = {
  id: string;
  title: string;
  period: string;
  description: string;
  role: string;
  techStack: string[];
  features: string[];
  palette: [string, string, string];
  icon: string;
};

const IMAGE_BATCH_SIZE = 18;

const aiDrawImages = [
  "/ai-draw/0271dd38-4e47-40b7-8eaa-f281cd416b3f.png",
  "/ai-draw/035be920-6690-435d-b503-6b094d601304.png",
  "/ai-draw/03f0f1ab-4426-4765-aa41-a47aecab5eb2.png",
  "/ai-draw/06082f6a-9398-4b78-83ff-aa5689721411.png",
  "/ai-draw/068fbfc3-75c4-4987-88a7-1401a227fb6a.png",
  "/ai-draw/0736c9a9-b403-4519-aeda-ae85b2af1621.png",
  "/ai-draw/077d8863-658c-47c1-b740-e7f499903382.png",
  "/ai-draw/0d826143-8782-4adb-b225-c5248d75732c.png",
  "/ai-draw/0fa60390-4beb-4c8e-82f7-99f4de9663fb.png",
  "/ai-draw/1125ad7e-928d-406d-8d0a-89fa4bff6d20.png",
  "/ai-draw/1296bdca-5a4e-4027-b966-fda6497bb3aa.png",
  "/ai-draw/18f0fe2f-cd24-41f5-9318-7221642b1bc6.png",
  "/ai-draw/1fea1b3f-3924-4f1d-b456-3a74ba8a0042.png",
  "/ai-draw/206f9a86-58e6-4c26-8936-7844d1d274e8.png",
  "/ai-draw/21bdde88-e99b-4e0a-83cc-19fc66d9beba.png",
  "/ai-draw/25e2b647-b56c-4e10-aa9f-1b09f33a26a3.png",
  "/ai-draw/29852309-67fb-4c39-854e-cbaae5c0e0f8.png",
  "/ai-draw/2b3df971-f821-46d7-9d46-8c358282a143.png",
  "/ai-draw/3948c134-1aab-46b3-a6ae-0da74277587e.png",
  "/ai-draw/3a15bba8-9d1c-4ed3-a905-56b2a33f998d.png",
  "/ai-draw/4d523c25-b4f0-4637-b601-d8b01e11c67e.png",
  "/ai-draw/575157ab-6491-47ed-8417-6e4bedbae798.png",
  "/ai-draw/5a97ccbb-d1e3-4779-a161-bfa612ce0e02.jpg",
  "/ai-draw/5d9f065e-a6dc-4279-80af-9e0243d1972c.png",
  "/ai-draw/5dcd162a-502e-4616-b032-52debbc2995f.png",
  "/ai-draw/5e7259ae-c2e7-4f69-ae4b-88cee0625470.png",
  "/ai-draw/5fe5a281-1104-43d5-9f85-bf255516d8e0.png",
  "/ai-draw/61051df6-146b-498c-9c2c-d80b15b4486d.png",
  "/ai-draw/6176ad7c-9b0a-46ce-925d-f7b38d39acf6.png",
  "/ai-draw/64e88170-642e-4de1-a1b2-785f064ed058.png",
  "/ai-draw/6562b623-a5e0-4963-ac79-b4d279a4c35b.png",
  "/ai-draw/663ea555-d938-4b9d-ae41-5cc79b2e80a2.png",
  "/ai-draw/688ab054-9400-4530-b524-ca2bab7a3245.png",
  "/ai-draw/69fc66d8-d728-4529-a4f3-aaa34b894e96.png",
  "/ai-draw/6aeb81ae-0976-4b02-a129-3d7143630776.png",
  "/ai-draw/6b8cc567-f309-4d77-8274-6307b05e5152.png",
  "/ai-draw/7ac0c446-e72e-4b94-b9fc-8ac0e46b2e0a.png",
  "/ai-draw/7b44933d-daea-4cbd-a789-95a75e0d9254.png",
  "/ai-draw/7df00b67-7e27-41e9-88e5-3659ad7db25c.png",
  "/ai-draw/7fa09202-8cc3-4a1f-8729-6c7ac8ff6d9b.png",
  "/ai-draw/8341a4a3-5490-4cd2-80d9-1aa78d8e27c9.png",
  "/ai-draw/8b4e377a-b33a-497b-aec4-e3040f106d47.png",
  "/ai-draw/902fd9c9-dc54-4679-862c-7187be57da4d.png",
  "/ai-draw/91e3f50c-68e1-4a5e-b139-e244011b2656.png",
  "/ai-draw/967c35a7-e36e-4e9f-9719-d387cf2bf5c1.png",
  "/ai-draw/9cd826e6-4218-45d6-8914-1641c08a703e.png",
  "/ai-draw/a0f72f71-f862-4c92-9910-16c4c4230e41.png",
  "/ai-draw/ab1d3001-209f-436d-948b-26b78c4eba68.png",
  "/ai-draw/ae90a282-e9a2-4247-9146-dd268cdc7196.png",
  "/ai-draw/bce2aa1b-502f-40d2-ab14-ff536a6911b6.png",
  "/ai-draw/bfad2d10-d22a-4198-8b76-463c47f4b1f1.png",
  "/ai-draw/c161c304-0214-4e3a-9c00-1edd4d5df447.png",
  "/ai-draw/c4e96bc5-294a-4460-82e3-fbd71de01cb2.png",
  "/ai-draw/c79f8c43-130e-4427-b811-ff4d6d911be2.png",
  "/ai-draw/c7e71fa7-159e-433a-b2e8-4dc91e7248d1.png",
  "/ai-draw/c8be6fd7-23e1-400b-9984-fca3f920b282.png",
  "/ai-draw/c9fdbd2a-ddde-401e-8d51-915a9d68577c.jpg",
  "/ai-draw/ca5fee12-ef2b-464f-9fc2-2c733b6d38f5.png",
  "/ai-draw/cc5b2b78-2da8-48cc-8931-1b1faf76ef3d.png",
  "/ai-draw/cfc37944-0b46-40c2-b6d1-5105632eb86f.png",
  "/ai-draw/df0eb33e-3bf8-4d15-b886-232ab5077fa4.png",
  "/ai-draw/e0786e26-67b8-4877-a353-8be3de80f120.png",
  "/ai-draw/e5cbf316-2e05-4f81-a3ab-e186288ef812.png",
  "/ai-draw/ede88d84-d92d-44ae-b94c-c322ea42d8a9.png",
  "/ai-draw/f59b4b2a-6a5e-4aeb-9abd-4e8f508ffeb4.png",
  "/ai-draw/fb0e2b5f-aec9-42c8-9425-5b35a46dff95.png",
  "/ai-draw/ff4652c9-e88a-4234-ba19-a6c5530294ed.png",
  "/ai-draw/a6a5ebb0-b4f3-402e-8b84-fe0563114a48.png",
  "/ai-draw/7a1068e2-2333-4489-a912-d61b570efbf0.png",
  "/ai-draw/5adea2d6-80ef-4d26-bd30-bb999e0cfc58.png",
  "/ai-draw/7b15c585-fe19-4bae-a4ab-39d4bfb1b654.png",
  "/ai-draw/bea81d33-e932-4044-a618-0e55d3ecf5c7.png",
  "/ai-draw/2ca79e3b-630a-4490-bbf0-eb513f011d44.png",
  "/ai-draw/5d6f953c-72a5-431d-969e-0cd70c80587a.png",
  "/ai-draw/0b5f23cd-6bd2-48d2-85fb-06bf6e061ea0.png",
  "/ai-draw/0a8b64cc-d18f-4a75-b548-41107ddaeeee.png",
];

const handDrawImages = [
  "/draw/2012-03-09.jpg",
  "/draw/2012-03-10-2.jpg",
  "/draw/2012-03-10.jpg",
  "/draw/2012-3-11-2.jpg",
  "/draw/2012-3-11.jpg",
  "/draw/2013-07-03.jpg",
  "/draw/2013-07-09.jpg",
  "/draw/2013-07-22.jpg",
  "/draw/2014-06-05.jpg",
  "/draw/2014-3-9.jpg",
  "/draw/2015-10-8.jpg",
  "/draw/2015-9-27.jpg",
  "/draw/2016-1-5.jpg",
  "/draw/2016-1-9-鼠.jpg",
  "/draw/2016-6-11-牛.jpg",
  "/draw/2016-6-26黑帮2.jpg",
  "/draw/2019-5-2.JPG",
  "/draw/2019-5-4.JPG",
  "/draw/2024-2-18.JPG",
  "/draw/2024-3-24.JPG",
  "/draw/2024-3-3.JPG",
  "/draw/2024-4-13.JPG",
  "/draw/2025-3-8.JPG",
  "/draw/2025-4-3.JPG",
  "/draw/2025-7-15.jpg",
  "/draw/2025-8-14.jpg",
  "/draw/2025-8-21.jpg",
  "/draw/2025-9-13.JPG",
];

const projects: ProjectItem[] = [
  {
    id: "p-telegram-analyzer",
    title: "Telegram 聊天记录智能分析系统",
    period: "2026.03 - 2026.07",
    description: "基于 FastAPI + React + Ollama 的聊天记录分析平台，支持多维度信息提取、AI 智能分析与 RAG 对话。",
    role: "全栈负责人 · 架构设计与技术选型",
    techStack: ["React 18", "TypeScript", "Ant Design", "Vite", "FastAPI", "SQLAlchemy", "LangChain", "Ollama", "ChromaDB", "MySQL"],
    features: ["聊天导入 — 自动解析清洗 Telegram 聊天记录", "信息提取 — 正则匹配提取手机号、身份证、银行卡等敏感信息", "AI 分析 — 基于 Map-Reduce 架构进行 5 维度深度分析", "RAG 对话 — 基于向量检索增强生成的智能问答"],
    palette: ["#4a90d9", "#7bb8e8", "#1a3a5c"],
    icon: "AI",
  },
  {
    id: "p-gas-inspection",
    title: "燃气安检业务管理平台",
    period: "企业级 · 全栈开发",
    description: "面向安检行业的企业级管理系统，包含微信小程序客户端和 Laravel 管理后台，实现客户管理、订单处理、安检记录、微信支付分账等业务流程。",
    role: "全栈开发 · 后台 API 与小程序客户端",
    techStack: ["Laravel 12", "PHP 8.2", "Filament", "uni-app", "MySQL", "微信支付", "Sanctum", "Queue"],
    features: ["客户信息管理（部门、楼层、业务类型）", "订单系统 — 客户/代理双模式、订单分配", "安检记录管理 — 创建、查询、详情", "微信支付与自动分账（Profit Sharing）", "管理后台 — Filament 表单/表格、数据统计面板"],
    palette: ["#e8734a", "#f0a878", "#5c2a1a"],
    icon: "燃",
  },
  {
    id: "p-forensic-institute",
    title: "司法鉴定所官方网站",
    period: "2026 · Web 平台",
    description: "面向司法鉴定机构的官方网站与内容管理后台，用于展示鉴定业务、机构信息、专业团队与对外服务内容。",
    role: "全栈开发 · 独立交付",
    techStack: ["Laravel", "Filament", "PHP", "MySQL", "响应式网页"],
    features: ["机构官网与业务信息展示", "基于 Filament 的内容管理后台", "栏目、文章与基础资料维护", "响应式适配与部署上线"],
    palette: ["#2f6f82", "#77a9b5", "#183b48"],
    icon: "鉴",
  },
  {
    id: "p-electron-forensics",
    title: "网证浏览器采集系统",
    period: "桌面应用 · Electron",
    description: "基于 Electron + React + TypeScript 开发的网页取证桌面应用，支持多标签页浏览、截图取证、视频录制与区块链存证。",
    role: "独立开发",
    techStack: ["Electron", "React 19", "TypeScript", "electron-vite"],
    features: ["多标签页浏览器 — Electron WebContentsView 实现，支持新建、切换、关闭", "网页截图取证 — capturePage API + 国密 SM3 哈希 + PNG/hash.csv", "视频录制保存 — MP4/WebM 格式，自动计算文件哈希", "固证系统 — 对接后端 API，支持区块链存证（zxchain）", "用户认证与文件管理 — Token 管理、自动归档"],
    palette: ["#6c5ce7", "#a29bfe", "#2d1b69"],
    icon: "证",
  },
  {
    id: "p-wechat-search",
    title: "微信聊天记录检索",
    period: "桌面工具 · Python / Flet",
    description: "基于 Flet 框架开发的 Windows 桌面微信消息搜索工具，支持关键词精确匹配与语义向量搜索两种模式。",
    role: "独立开发",
    techStack: ["Python", "Flet", "BeautifulSoup4", "sentence-transformers", "cosine_similarity"],
    features: ["消息解析 — BeautifulSoup4 解析微信 HTML 备份文件", "关键词精确匹配", "语义向量搜索 — sentence-transformers 多语言模型", "余弦相似度计算", "模块化架构 — 解析、搜索、缓存、UI 分层"],
    palette: ["#00b894", "#55efc4", "#005a45"],
    icon: "搜",
  },
  {
    id: "p-image-search",
    title: "AI 图片搜索助手",
    period: "桌面工具 · Python / Flet",
    description: "基于 Flet 框架开发的 Windows 桌面图片搜索工具，支持 OCR 文字识别与语义向量搜索两种模式，从本地海量图片中快速定位目标内容。",
    role: "独立开发",
    techStack: ["Python", "Flet", "EasyOCR", "Chinese-CLIP", "FAISS"],
    features: ["OCR 文字识别 — EasyOCR 多语言文字提取", "语义向量搜索 — Chinese-CLIP 自然语言语义理解", "FAISS 向量检索", "模块化架构 — 文件服务、OCR 服务、语义搜索服务、UI 层"],
    palette: ["#fdcb6e", "#ffeaa7", "#6c5a00"],
    icon: "图",
  },
  {
    id: "p-bitspay",
    title: "bitsPay 支付网关",
    period: "2015.01 - 2025.12",
    description: "重构 acquired 支付网关项目，用更新更强大的架构重新设计和开发新支付网关。",
    role: "新网关管理后台设计与开发",
    techStack: ["Vue 3", "Go", "PostgreSQL"],
    features: ["新支付网关架构设计", "管理后台设计与开发", "高性能网关服务"],
    palette: ["#e17055", "#fab1a0", "#5c2a1a"],
    icon: "￥",
  },
  {
    id: "p-acquired",
    title: "Acquired 支付网关",
    period: "2017.10 - 2025.12",
    description: "英国地区多渠道支付网关，具备强大的银行与卡组织适配能力，对接 Trust Payments、Cashflows、Barclaycard 等收单行及 Visa、Mastercard、Amex 等发卡机构。",
    role: "全栈开发 · 运维保障",
    techStack: ["HTML", "CSS", "JavaScript", "Vue", "PHP", "Redis", "MySQL", "Docker"],
    features: ["多渠道支付 — Apple Pay、Google Pay、Card Pay", "灵活集成 — Component、Checkout、API 方案", "3DS v2 安全认证协议", "PCI 认证合规", "多币种实时转换", "Docker 部署架构优化"],
    palette: ["#0984e3", "#74b9ff", "#002d5a"],
    icon: "Pay",
  },
  {
    id: "p-cloud-academy",
    title: "云学院管理系统",
    period: "2021.04 - 2021.09",
    description: "基于 Vue 和 CodeIgniter 框架开发的在线课程学习平台，提供完整的在线课程学习体系。",
    role: "项目负责人 · 团队搭建与全流程管理",
    techStack: ["Vue", "CodeIgniter", "MySQL"],
    features: ["多类型课程资源上传（视频、Word、PPT、Excel、图片）", "课程分类与学习进度记录", "学习计划创建与管理", "问卷调查与在线考试", "题库练习系统"],
    palette: ["#00cec9", "#81ecec", "#004d4a"],
    icon: "学",
  },
  {
    id: "p-sustech-quantum",
    title: "南方科技大学 · 量子科学与工程研究院",
    period: "2018.04 - 2018.05",
    description: "南方科技大学量子科学与工程研究院官方网站，面向公众与学术界的权威信息展示平台。",
    role: "项目负责人 · 全生命周期管理",
    techStack: ["前端开发", "UI 视觉设计", "部署运维"],
    features: ["研究院信息展示平台", "最新研究成果与科研进展", "学术动态发布", "人才团队展示", "科技感 UI 视觉设计"],
    palette: ["#6a5acd", "#9370db", "#2d1b4e"],
    icon: "量",
  },
  {
    id: "p-star-flower",
    title: "星云花坊电子商务系统",
    period: "2016.10 - 2017.10",
    description: "基于 ThinkPHP + Bootstrap + jQuery 开发的微信服务号电商系统，四大业务板块覆盖多种鲜花订购场景。",
    role: "技术负责人 · 架构设计到全栈开发",
    techStack: ["ThinkPHP", "Bootstrap", "jQuery", "微信服务号"],
    features: ["单品鲜花订购 — 可选一周内日期下单", "包月鲜花订购 — 每月分 4 次配送", "花束花篮订购 — 购物车、节假日改价、关键字筛选", "拼团商城 — 满标成团、未达成退款", "微信卡券与平台优惠券灵活组合"],
    palette: ["#fd79a8", "#fab1a0", "#5c1a3a"],
    icon: "花",
  },
  {
    id: "p-dragon-cloud",
    title: "龙跃星云电子商务系统",
    period: "2015.11 - 2016.10",
    description: "基于 ThinkPHP 框架的微信服务号电商系统，三大创新商城模式。",
    role: "技术负责人 · 独立全栈开发",
    techStack: ["ThinkPHP", "Bootstrap", "jQuery", "微信服务号"],
    features: ["全返商城 — 消费金额按比例返还", "分销商城 — 多级分销利润分润", "夺宝商城 — 满标幸运用户规则计算"],
    palette: ["#00b894", "#55efc4", "#005a45"],
    icon: "商",
  },
  {
    id: "p-bank-trade",
    title: "银务通业务交单分润系统",
    period: "2015.10 - 2015.11",
    description: "基于 ThinkPHP + Bootstrap 的公众号交单分润系统，关注公众号的用户可在其上交单，每月根据业务交单数量进行分润。",
    role: "技术负责人 · 独立完成",
    techStack: ["ThinkPHP", "Bootstrap", "微信公众号"],
    features: ["公众号交单管理", "业务数据统计", "月度分润计算与结算"],
    palette: ["#e17055", "#fab1a0", "#5c2a1a"],
    icon: "银",
  },
  {
    id: "p-henduo-p2p",
    title: "亨多财富 P2P 网上借贷系统",
    period: "2013.10 - 2015.10",
    description: "P2P 借贷平台二次开发，基于 ThinkPHP + Bootstrap，网页版二次开发 + 微信公众号全栈开发。",
    role: "技术负责人 · 安全防护与系统优化",
    techStack: ["ThinkPHP", "Bootstrap", "微信公众号"],
    features: ["借款标在线发布与管理", "投资用户投标选择", "按月收益返还", "平台安全防护体系", "服务器运维保障"],
    palette: ["#0984e3", "#74b9ff", "#002d5a"],
    icon: "P2P",
  },
  {
    id: "p-price-monitor",
    title: "某省价格监测采价分析系统",
    period: "2012.12 - 2013.04",
    description: "基于 .NET 的 B/S 模式价格监测系统，因保密协议不便透露具体业务。",
    role: "前端开发 · UI 设计与交互实现",
    techStack: [".NET", "B/S 架构", "JavaScript"],
    features: ["整体项目 UI 设计与实现", "前台交互脚本编写", "前后端交互设计", "部分后台代码编写"],
    palette: ["#636e72", "#b2bec3", "#2d3436"],
    icon: "价",
  },
];

const categories: Array<{
  id: WorkCategory;
  index: string;
  label: string;
  english: string;
  mark: string;
  description: string;
}> = [
  {
    id: "projects",
    index: "01",
    label: "项目",
    english: "PROJECTS",
    mark: "项",
    description: "从 2013 到 2026，独立或主导开发的项目记录，涵盖支付网关、电商系统、AI 工具与桌面应用。",
  },
  {
    id: "illustrations",
    index: "02",
    label: "手绘",
    english: "ILLUSTRATIONS",
    mark: "画",
    description: "角色、场景与日常，节选部分，有些不宜展示。",
  },
  {
    id: "wallpapers",
    index: "03",
    label: "AI 绘画",
    english: "AI ARTWORKS",
    mark: "景",
    description: "用生成式 AI 探索角色、场景与视觉风格。",
  },
];

const categoryRoutes: Record<WorkCategory, string> = {
  wallpapers: "/aigc/ai-art",
  projects: "/projects",
  illustrations: "/drawing",
};

const collections: Record<WorkCategory, WorkItem[]> = {
  wallpapers: aiDrawImages.map((image, index) => ({
    id: `ai-${String(index + 1).padStart(2, "0")}`,
    title: `AI 绘画 ${String(index + 1).padStart(2, "0")}`,
    note: "AI 视觉创作",
    year: "2026",
    palette: ["#536c78", "#df9a72", "#f4d8b4"],
    variant: (index % 6) + 1,
    image: sitePath(image),
  })),
  illustrations: handDrawImages.map((image, index) => ({
    id: `draw-${String(index + 1).padStart(2, "0")}`,
    title: `手绘作品 ${String(index + 1).padStart(2, "0")}`,
    note: "手绘练习",
    year: image.match(/\/draw\/(\d{4})/)?.[1] ?? "",
    palette: ["#d7794f", "#eeb77d", "#58705b"],
    variant: (index % 6) + 1,
    image: sitePath(image),
  })),
  projects: [],
};

function WorkVisual({ category, item }: { category: WorkCategory; item: WorkItem }) {
  const style = {
    "--work-a": item.palette[0],
    "--work-b": item.palette[1],
    "--work-c": item.palette[2],
  } as CSSProperties;

  if ((category === "wallpapers" || category === "illustrations") && item.image) {
    return (
      <div className="works-visual works-ai-visual">
        <img src={item.image} alt="" loading="lazy" decoding="async" />
        <span className="works-ai-expand" aria-hidden="true">↗</span>
      </div>
    );
  }

  return (
    <div className={`works-visual works-${category}-visual works-art-${item.variant}`} style={style}>
      <span className="works-art-sun" />
      <span className="works-art-land" />
      <span className="works-art-window" />
      <span className="works-art-character"><i /></span>
      <small>{category === "wallpapers" ? "QUIET LANDSCAPE" : "A SMALL STORY"}</small>
    </div>
  );
}

function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const style = {
    "--work-a": project.palette[0],
    "--work-b": project.palette[1],
    "--work-c": project.palette[2],
    "--item-order": index,
  } as CSSProperties;

  return (
    <article className="works-project-card" style={style}>
      <div className="works-project-visual">
        <span className="works-project-icon">{project.icon}</span>
      </div>
      <div className="works-project-body">
        <header className="works-project-header">
          <div>
            <span className="works-project-period">{project.period}</span>
            <h3>{project.title}</h3>
          </div>
          <span className="works-project-role">{project.role}</span>
        </header>
        <p className="works-project-desc">{project.description}</p>
        <div className="works-project-stack">
          {project.techStack.map((tech) => <span key={tech}>{tech}</span>)}
        </div>
        <ul className="works-project-features">
          {project.features.map((feature) => <li key={feature}>{feature}</li>)}
        </ul>
      </div>
    </article>
  );
}

export function WorksContent({ initialCategory = "projects" }: { initialCategory?: WorkCategory }) {
  const [activeCategory] = useState<WorkCategory>(initialCategory);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [visibleAiCount, setVisibleAiCount] = useState(IMAGE_BATCH_SIZE);
  const [visibleDrawCount, setVisibleDrawCount] = useState(IMAGE_BATCH_SIZE);
  const [aiColumnCount, setAiColumnCount] = useState(4);
  const { theme, toggleTheme, noTransition } = useTheme();
  const imageLoadMoreRef = useRef<HTMLDivElement>(null);
  const category = categories.find((item) => item.id === activeCategory) ?? categories[0];
  const items = collections[activeCategory];
  const isProjects = activeCategory === "projects";
  const isImageGallery = activeCategory === "wallpapers" || activeCategory === "illustrations";
  const visibleImageCount = activeCategory === "illustrations" ? visibleDrawCount : visibleAiCount;
  const visibleItems = isImageGallery ? items.slice(0, visibleImageCount) : items;
  const galleryItems = isImageGallery ? items : collections.wallpapers;
  const activeGalleryImage = activeImageIndex === null ? null : galleryItems[activeImageIndex];

  useEffect(() => {
    const updateColumnCount = () => {
      setAiColumnCount(window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 3 : 4);
    };

    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  useEffect(() => {
    const loadMoreTarget = imageLoadMoreRef.current;
    if (!isImageGallery || !loadMoreTarget || visibleImageCount >= galleryItems.length) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (activeCategory === "illustrations") {
          setVisibleDrawCount((current) => Math.min(current + IMAGE_BATCH_SIZE, galleryItems.length));
        } else {
          setVisibleAiCount((current) => Math.min(current + IMAGE_BATCH_SIZE, galleryItems.length));
        }
      },
      { rootMargin: "300px 0px", threshold: 0.01 },
    );

    observer.observe(loadMoreTarget);
    return () => observer.disconnect();
  }, [activeCategory, galleryItems.length, isImageGallery, visibleImageCount]);

  useEffect(() => {
    if (activeImageIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveImageIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveImageIndex((current) => current === null ? null : (current - 1 + galleryItems.length) % galleryItems.length);
      }
      if (event.key === "ArrowRight") {
        setActiveImageIndex((current) => current === null ? null : (current + 1) % galleryItems.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, galleryItems.length]);

  const showPreviousImage = () => {
    setActiveImageIndex((current) => current === null ? null : (current - 1 + galleryItems.length) % galleryItems.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => current === null ? null : (current + 1) % galleryItems.length);
  };

  const renderWorkItem = (item: WorkItem, index: number) => (
    <article className="works-item" key={item.id} style={{ "--item-order": index } as CSSProperties}>
      {isImageGallery ? (
        <button className="works-item-trigger" type="button" onClick={() => setActiveImageIndex(index)} aria-label="查看大图">
          <WorkVisual category={activeCategory} item={item} />
        </button>
      ) : (
        <>
          <WorkVisual category={activeCategory} item={item} />
          <div className="works-item-meta">
            <div><span>{item.note}</span><h3>{item.title}</h3></div>
            <small>{item.year}</small>
          </div>
        </>
      )}
    </article>
  );

  return (
    <main className={`works-page${noTransition ? " no-transition" : ""}`} data-theme={theme} suppressHydrationWarning>
      <ContentHeader subtitle={category.english} activeHref={categoryRoutes[activeCategory]} theme={theme} onToggleTheme={toggleTheme} />

      <section className="works-gallery" aria-live="polite">
        <header className="works-gallery-header">
          <div><p>{category.english}</p><h2>{category.label}</h2></div>
          <p>{category.description}</p>
          <span>{String(isProjects ? projects.length : items.length).padStart(2, "0")} ITEMS</span>
        </header>

        {isProjects ? (
          <div className="works-projects-list">
            {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
          </div>
        ) : (
          <div className="works-grid" data-category={activeCategory}>
            {isImageGallery ? (
              Array.from({ length: aiColumnCount }, (_, columnIndex) => (
                <div className="works-ai-column" key={columnIndex}>
                  {visibleItems.map((item, index) => ({ item, index }))
                    .filter(({ index }) => index % aiColumnCount === columnIndex)
                    .map(({ item, index }) => renderWorkItem(item, index))}
                </div>
              ))
            ) : visibleItems.map((item, index) => renderWorkItem(item, index))}
          </div>
        )}

        {isImageGallery && visibleImageCount < items.length ? (
          <div className="works-load-more" ref={imageLoadMoreRef} aria-live="polite">
            <span>继续向下滚动加载</span>
            <small>{visibleImageCount} / {items.length}</small>
          </div>
        ) : null}
      </section>

      <footer className="works-footer">
        <span>© 2026 PL-HOME</span>
        <a href={sitePath("/")}>← Back to desk</a>
      </footer>

      {activeGalleryImage && activeImageIndex !== null ? (
        <div className="pokemon-card-modal-backdrop ai-draw-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveImageIndex(null); }}>
          <section className="pokemon-card-modal ai-draw-modal" role="dialog" aria-modal="true" aria-labelledby="ai-draw-modal-title">
            <header className="pokemon-card-modal-header">
              <div>
                <span>{activeCategory === "illustrations" ? "HAND DRAWING" : "AI ARTWORK"} · {String(activeImageIndex + 1).padStart(2, "0")}</span>
                <h2 id="ai-draw-modal-title">{activeGalleryImage.title}</h2>
              </div>
              <p>{String(activeImageIndex + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}</p>
              <button type="button" autoFocus onClick={() => setActiveImageIndex(null)} aria-label="关闭大图预览">×</button>
            </header>

            <div className="pokemon-card-player ai-draw-player">
              <button className="pokemon-card-switch is-previous" type="button" onClick={showPreviousImage} aria-label="上一张图片">←</button>
              <div className="ai-draw-image-frame">
                <img
                  key={activeGalleryImage.image}
                  src={activeGalleryImage.image}
                  alt={activeGalleryImage.title}
                />
              </div>
              <button className="pokemon-card-switch is-next" type="button" onClick={showNextImage} aria-label="下一张图片">→</button>
            </div>

            <nav className="pokemon-card-filmstrip ai-draw-filmstrip" aria-label={activeCategory === "illustrations" ? "选择手绘作品" : "选择 AI 绘画作品"}>
              {galleryItems.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={index === activeImageIndex ? "is-active" : ""}
                  aria-current={index === activeImageIndex ? "true" : undefined}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`查看${item.title}`}
                >
                  <img src={item.image} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </nav>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default function WorksPage() {
  return <WorksContent initialCategory="projects" />;
}
