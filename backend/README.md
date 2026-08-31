# 漫画文字翻译 API

这个服务为 `/tools/manga-translator` 提供文字区域检测、OCR 与翻译接口。

## 启动

```bash
cd "/Users/pan/Documents/个人藏宝库"
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8011
```

前端仍使用原来的开发命令，默认运行在 `http://localhost:3003`。

## OCR 说明

- 没有 Tesseract 时：服务会自动检测可能的文字区域，原文由用户手动填写。
- 安装 Tesseract 以及 `jpn`、`jpn_vert` 语言包后：接口会自动返回识别文本。
- 翻译接口目前是明确标注的演示词典，后续可在 `/api/translate` 内替换为正式模型调用。
