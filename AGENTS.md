# 项目协作约定

## 正式发布流程

用户要求正式发布网站时，必须完成全部步骤，不要只更新其中一个托管端：

1. 完成修改并通过必要的构建与测试。
2. 将源码提交并推送到私有 GitHub 仓库 `peterpan1991/pl-home`。
3. 发布或更新 OpenAI Sites 站点。
4. 执行 `npm run build:pages` 生成静态产物。
5. 只将 `out/` 中的静态产物发布到公开仓库 `peterpan1991/peterpan1991.github.io`，不要把源码复制到该仓库。
6. 分别访问并验证 Sites 地址和 `https://peterpan1991.github.io/`，确认页面及主要静态资源可用。

除非用户明确说明只发布某一个环境，否则“发布”默认指同时完成以上 GitHub 源码、OpenAI Sites 和 GitHub Pages 三处同步。
