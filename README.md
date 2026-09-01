# PL-HOME

一个以个人作品与兴趣为核心的交互式创作主页。首页使用 React Three Fiber 构建可探索的 3D 书桌，并包含作品、漫画、笔记、工具和关于我等内容页面。

## 本地运行

要求 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

默认开发地址由终端输出，通常为 `http://localhost:3003`。

## 验证

```bash
npm run build
npm test
```

## GitHub Pages

```bash
npm run build:pages
```

静态文件会生成到 `out/`，用于发布到独立的公开仓库 `peterpan1991.github.io`；本仓库继续保持私有。

正式发布时需要同时更新私有源码仓库、OpenAI Sites 和公开 GitHub Pages。完整流程见 `AGENTS.md`。

## 目录

- `app/`：页面、组件和全局样式
- `public/`：网站使用的图片、视频和网页模型
- `models/`：可编辑的 Blender 源模型
- `design/`：模型参考图与制作预览
- `scripts/`：模型生成和优化脚本
- `backend/`：漫画 OCR/翻译原型后端，当前前端发布不依赖它
- `.openai/hosting.json`：Sites 托管配置

## 主要技术

- React / Next.js / TypeScript
- React Three Fiber / Three.js
- vinext / Vite / Cloudflare Workers
- Python / FastAPI（可选工具后端）
