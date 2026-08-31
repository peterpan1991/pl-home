"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ContentHeader } from "../../components/SiteHeaders";

type ThemeMode = "day" | "night";
type RegionDirection = "horizontal" | "vertical";

type TextRegion = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceText: string;
  translatedText: string;
  confidence: number;
  direction: RegionDirection;
};

type DraftRegion = Pick<TextRegion, "x" | "y" | "width" | "height">;

// Frontend-only build: keep every FastAPI request behind this switch until the
// backend is deployed. Manual framing, editing, previewing and export still work.
const BACKEND_ENABLED = false;
const API_BASE = process.env.NEXT_PUBLIC_MANGA_API_URL ?? "http://127.0.0.1:8011";

const toolSections = [
  { index: "01", label: "漫画翻译", english: "TRANSLATE", mark: "文", active: true },
  { index: "02", label: "漫画分格", english: "PANEL SPLIT", mark: "格", active: false },
  { index: "03", label: "模型素材", english: "3D ASSETS", mark: "模", active: false },
] as const;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function makeRegionId() {
  return `region-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createDemoImage(): { dataUrl: string; regions: TextRegion[]; width: number; height: number } {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 820;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("当前浏览器无法创建演示图片。 ");

  context.fillStyle = "#f7efe3";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#3c312c";
  context.lineWidth = 10;
  context.strokeRect(42, 42, 535, 736);
  context.strokeRect(623, 42, 535, 736);

  context.fillStyle = "#e6a878";
  context.beginPath();
  context.arc(310, 530, 142, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#564a43";
  context.beginPath();
  context.arc(310, 420, 86, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#73845c";
  context.fillRect(735, 445, 300, 238);
  context.fillStyle = "#e27a52";
  context.beginPath();
  context.arc(885, 370, 88, 0, Math.PI * 2);
  context.fill();

  const bubbles = [
    { x: 95, y: 100, w: 380, h: 170, text: "こんにちは！" },
    { x: 715, y: 105, w: 350, h: 160, text: "今日も冒険へ" },
  ];
  context.font = "700 42px sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const bubble of bubbles) {
    context.fillStyle = "#fffdf9";
    context.strokeStyle = "#3c312c";
    context.lineWidth = 7;
    context.beginPath();
    context.roundRect(bubble.x, bubble.y, bubble.w, bubble.h, 72);
    context.fill();
    context.stroke();
    context.fillStyle = "#3c312c";
    context.fillText(bubble.text, bubble.x + bubble.w / 2, bubble.y + bubble.h / 2);
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
    regions: [
      {
        id: makeRegionId(), x: 0.079, y: 0.122, width: 0.317, height: 0.207,
        sourceText: "こんにちは！", translatedText: "你好！", confidence: 99, direction: "horizontal",
      },
      {
        id: makeRegionId(), x: 0.596, y: 0.128, width: 0.292, height: 0.195,
        sourceText: "今日も冒険へ", translatedText: "今天也去冒险吧", confidence: 99, direction: "horizontal",
      },
    ],
  };
}

export default function MangaTranslatorPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drawingStart = useRef<{ x: number; y: number } | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("day");
  const [imageData, setImageData] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageSize, setImageSize] = useState({ width: 1200, height: 820 });
  const [regions, setRegions] = useState<TextRegion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRegion | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [showTranslation, setShowTranslation] = useState(true);
  const [busy, setBusy] = useState<"ocr" | "region" | "translate" | null>(null);
  const [notice, setNotice] = useState("上传一张漫画图片，或先载入演示项目。");
  const [serverState, setServerState] = useState<"frontend" | "online" | "offline">("frontend");

  const selected = useMemo(() => regions.find((region) => region.id === selectedId) ?? null, [regions, selectedId]);
  const translatedCount = regions.filter((region) => region.translatedText.trim()).length;

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("creative-desk-theme");
    if (savedTheme === "day" || savedTheme === "night") setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "day" ? "night" : "day";
      window.localStorage.setItem("creative-desk-theme", next);
      return next;
    });
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setNotice("请选择 PNG、JPG 或 WebP 图片。");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setNotice("图片不能超过 12MB。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const image = new Image();
      image.onload = () => {
        setImageData(dataUrl);
        setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
        setFileName(file.name);
        setRegions([]);
        setSelectedId(null);
        setNotice("图片已载入。当前为纯前端模式，请手动框选文字区域并填写原文与译文。");
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const loadDemo = () => {
    const demo = createDemoImage();
    setImageData(demo.dataUrl);
    setImageSize({ width: demo.width, height: demo.height });
    setFileName("demo-comic.png");
    setRegions(demo.regions);
    setSelectedId(demo.regions[0].id);
    setNotice("演示项目已载入：点击框选区域，在右侧修改原文和译文。");
  };

  const pointFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return null;
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    };
  };

  const beginDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawMode || !imageData || busy) return;
    const point = pointFromEvent(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingStart.current = point;
    setSelectedId(null);
    setDraft({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const continueDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawingStart.current) return;
    const point = pointFromEvent(event);
    if (!point) return;
    const start = drawingStart.current;
    setDraft({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  };

  const finishDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawingStart.current || !draft) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    drawingStart.current = null;
    if (draft.width > 0.018 && draft.height > 0.018) {
      const region: TextRegion = {
        ...draft,
        id: makeRegionId(),
        sourceText: "",
        translatedText: "",
        confidence: 0,
        direction: draft.height > draft.width * 1.45 ? "vertical" : "horizontal",
      };
      setRegions((current) => [...current, region]);
      setSelectedId(region.id);
      setNotice("已创建文字区域。请在右侧填写原文与译文。");
      if (BACKEND_ENABLED) void recognizeRegion(region);
    }
    setDraft(null);
  };

  const cropRegion = (region: TextRegion) => new Promise<string>((resolve, reject) => {
    const source = new Image();
    source.onload = () => {
      const sourceX = Math.max(0, Math.round(region.x * source.naturalWidth));
      const sourceY = Math.max(0, Math.round(region.y * source.naturalHeight));
      const sourceWidth = Math.max(1, Math.min(source.naturalWidth - sourceX, Math.round(region.width * source.naturalWidth)));
      const sourceHeight = Math.max(1, Math.min(source.naturalHeight - sourceY, Math.round(region.height * source.naturalHeight)));
      const scale = Math.min(3, Math.max(1, 1200 / Math.max(sourceWidth, sourceHeight)));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("无法读取框选区域"));
        return;
      }
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    source.onerror = () => reject(new Error("无法裁切当前图片"));
    source.src = imageData;
  });

  const recognizeRegion = async (region: TextRegion) => {
    if (!imageData) return;
    if (!BACKEND_ENABLED) {
      setNotice("当前为纯前端模式，自动 OCR 暂未启用；请在右侧手动填写原文。");
      return;
    }
    setBusy("region");
    try {
      const croppedImage = await cropRegion(region);
      const response = await fetch(`${API_BASE}/api/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data: croppedImage, language: ocrLanguage, direction: region.direction, scope: "region" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail ?? "识别失败");
      const text = (payload.regions as Array<Record<string, string>>)
        .map((item) => String(item.source_text ?? "").trim())
        .filter(Boolean)
        .join(" ");
      if (text) {
        setRegions((current) => current.map((item) => item.id === region.id ? { ...item, sourceText: text, confidence: Math.max(...payload.regions.map((entry: Record<string, number>) => Number(entry.confidence ?? 0))) } : item));
        setNotice(`当前框识别完成：${text}`);
        setServerState("online");
      } else {
        setNotice(payload.warning ?? "当前框没有识别到文字。请框紧一些、确认识别语言，或在右侧手动输入。");
      }
    } catch (error) {
      setServerState("offline");
      setNotice(`当前框识别失败：${error instanceof Error ? error.message : "请检查 FastAPI 服务"}`);
    } finally {
      setBusy(null);
    }
  };

  const runOCR = async () => {
    if (!imageData) {
      setNotice("请先上传图片。");
      return;
    }
    if (!BACKEND_ENABLED) {
      setNotice("当前为纯前端模式，自动 OCR 暂未启用；你仍可使用手动框选。");
      return;
    }
    setBusy("ocr");
    setNotice("正在检测文字区域…");
    try {
      const response = await fetch(`${API_BASE}/api/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_data: imageData, language: ocrLanguage, direction: "auto", scope: "page" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail ?? "识别失败");
      const nextRegions: TextRegion[] = payload.regions.map((region: Record<string, number | string>) => ({
        id: String(region.id),
        x: Number(region.x),
        y: Number(region.y),
        width: Number(region.width),
        height: Number(region.height),
        sourceText: String(region.source_text ?? ""),
        translatedText: "",
        confidence: Number(region.confidence ?? 0),
        direction: region.direction === "vertical" ? "vertical" : "horizontal",
      }));
      setRegions(nextRegions);
      setSelectedId(nextRegions[0]?.id ?? null);
      setServerState("online");
      setNotice(payload.warning ?? `识别完成，共找到 ${nextRegions.length} 个文字区域。`);
    } catch (error) {
      setServerState("offline");
      setNotice(`后端未连接：${error instanceof Error ? error.message : "请启动 FastAPI 服务"}。仍可手动框选。`);
    } finally {
      setBusy(null);
    }
  };

  const translateAll = async () => {
    const targets = regions.filter((region) => region.sourceText.trim());
    if (!targets.length) {
      setNotice("请先识别或填写至少一条原文。");
      return;
    }
    if (!BACKEND_ENABLED) {
      setNotice("当前为纯前端模式，自动翻译暂未启用；请在右侧手动填写译文。");
      return;
    }
    setBusy("translate");
    setNotice("正在生成演示翻译…");
    try {
      const response = await fetch(`${API_BASE}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: targets.map((region) => region.sourceText), source_language: "ja", target_language: "zh-CN" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail ?? "翻译失败");
      const translations = payload.translations as string[];
      const translationById = new Map(targets.map((region, index) => [region.id, translations[index] ?? ""]));
      setRegions((current) => current.map((region) => translationById.has(region.id) ? { ...region, translatedText: translationById.get(region.id) ?? "" } : region));
      setNotice(payload.warning ?? "翻译完成。");
    } catch (error) {
      setNotice(`翻译接口未连接：${error instanceof Error ? error.message : "请检查服务"}。你仍可手动填写译文。`);
    } finally {
      setBusy(null);
    }
  };

  const updateSelected = (patch: Partial<TextRegion>) => {
    if (!selectedId) return;
    setRegions((current) => current.map((region) => region.id === selectedId ? { ...region, ...patch } : region));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setRegions((current) => current.filter((region) => region.id !== selectedId));
    setSelectedId(null);
    setNotice("已删除当前区域。");
  };

  const exportProject = () => {
    if (!imageData) return;
    const project = {
      version: 1,
      image: { fileName, width: imageSize.width, height: imageSize.height },
      regions,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.replace(/\.[^.]+$/, "") || "comic"}-translation.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("项目标注已导出为 JSON，不包含原始图片。");
  };

  const regionStyle = (region: DraftRegion): CSSProperties => ({
    left: `${region.x * 100}%`,
    top: `${region.y * 100}%`,
    width: `${region.width * 100}%`,
    height: `${region.height * 100}%`,
  });

  return (
    <main className="manga-tool-page" data-theme={theme}>
      <ContentHeader subtitle="AI COMIC LAB" activeHref="/tools/manga-translator" theme={theme} onToggleTheme={toggleTheme} />

      <nav className="manga-tool-sections" aria-label="工具子栏目">
        {toolSections.map((section) => (
          <button
            type="button"
            key={section.label}
            className={section.active ? "is-active" : ""}
            aria-current={section.active ? "page" : undefined}
            disabled={!section.active}
            title={section.active ? section.label : `${section.label}正在筹备中`}
          >
            <span>{section.mark}</span>
            <strong><small>{section.index} · {section.english}</small>{section.label}</strong>
            {!section.active && <i>筹备中</i>}
          </button>
        ))}
      </nav>

      <section className="manga-tool-toolbar" aria-label="编辑工具栏">
        <div className="manga-toolbar-group">
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => event.target.files?.[0] && loadFile(event.target.files[0])} />
          <button className="is-primary" type="button" onClick={() => inputRef.current?.click()}>＋ 上传图片</button>
          <button type="button" onClick={loadDemo}>载入演示</button>
          <span className={`manga-server-state is-${serverState}`}><i />{serverState === "frontend" ? "纯前端模式" : serverState === "online" ? "API 已连接" : "API 未连接"}</span>
        </div>
        <div className="manga-toolbar-group is-center">
          <label className="manga-language-select">识别语言
            <select value={ocrLanguage} disabled={!BACKEND_ENABLED} onChange={(event) => setOcrLanguage(event.target.value)}>
              <option value="eng">英文</option>
              <option value="jpn">日文（需语言包）</option>
              <option value="jpn+eng">日英混合（需语言包）</option>
            </select>
          </label>
          <button type="button" disabled={!BACKEND_ENABLED || !imageData || busy !== null} onClick={runOCR}>{BACKEND_ENABLED ? (busy === "ocr" ? "识别中…" : "自动识别") : "自动识别（暂缓）"}</button>
          <button className={drawMode ? "is-active" : ""} type="button" disabled={!imageData} onClick={() => setDrawMode((current) => !current)}>▱ 手动框选</button>
          <button type="button" disabled={!BACKEND_ENABLED || !regions.length || busy !== null} onClick={translateAll}>{BACKEND_ENABLED ? (busy === "translate" ? "翻译中…" : "翻译全部") : "自动翻译（暂缓）"}</button>
        </div>
        <div className="manga-toolbar-group is-end">
          <label><input type="checkbox" checked={showTranslation} onChange={(event) => setShowTranslation(event.target.checked)} />预览译文</label>
          <button type="button" disabled={!imageData} onClick={exportProject}>导出标注</button>
        </div>
      </section>

      <section className="manga-workspace">
        <div
          className={`manga-image-panel${drawMode ? " is-drawing" : ""}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) loadFile(file);
          }}
        >
          <div className="manga-panel-heading">
            <div><p>CANVAS</p><strong>{fileName || "尚未选择图片"}</strong></div>
            <span>{imageData ? `${imageSize.width} × ${imageSize.height}` : "PNG / JPG / WEBP"}</span>
          </div>

          <div className="manga-stage-shell">
            {imageData ? (
              <div
                ref={stageRef}
                className="manga-image-stage"
                style={{ aspectRatio: `${imageSize.width} / ${imageSize.height}`, width: `min(100%, calc(66vh * ${imageSize.width / imageSize.height}))` }}
                onPointerDown={beginDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={finishDrawing}
                onPointerCancel={() => { drawingStart.current = null; setDraft(null); }}
              >
                <img src={imageData} alt="当前漫画页面" draggable={false} />
                {regions.map((region, index) => (
                  <button
                    key={region.id}
                    type="button"
                    className={`manga-region${selectedId === region.id ? " is-selected" : ""}${region.translatedText ? " has-translation" : ""}`}
                    style={regionStyle(region)}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setSelectedId(region.id)}
                    aria-label={`选择文字区域 ${index + 1}`}
                  >
                    <span>{index + 1}</span>
                    {showTranslation && region.translatedText && <em>{region.translatedText}</em>}
                  </button>
                ))}
                {draft && <div className="manga-region is-draft" style={regionStyle(draft)} />}
              </div>
            ) : (
              <button className="manga-empty-stage" type="button" onClick={() => inputRef.current?.click()}>
                <span>＋</span>
                <strong>拖入漫画图片</strong>
                <small>或点击这里选择文件 · 最大 12MB</small>
              </button>
            )}
          </div>
          <div className="manga-canvas-status"><span>{notice}</span><b>{regions.length} 个区域 · {translatedCount} 条译文</b></div>
        </div>

        <aside className="manga-inspector">
          <div className="manga-panel-heading">
            <div><p>TEXT REGIONS</p><strong>文字与翻译</strong></div>
            <span>{String(regions.length).padStart(2, "0")}</span>
          </div>

          <div className="manga-region-list" aria-label="文字区域列表">
            {regions.length ? regions.map((region, index) => (
              <button key={region.id} type="button" className={selectedId === region.id ? "is-active" : ""} onClick={() => setSelectedId(region.id)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{region.sourceText || "等待填写原文"}</strong>
                <small>{region.translatedText || (region.confidence ? `置信度 ${Math.round(region.confidence)}%` : "手动区域")}</small>
              </button>
            )) : <div className="manga-empty-list"><span>▱</span><p>识别结果和手动框选区域会出现在这里。</p></div>}
          </div>

          <div className="manga-editor-fields">
            {selected ? (
              <>
                <div className="manga-field-heading"><span>正在编辑区域 {regions.findIndex((region) => region.id === selected.id) + 1}</span><button type="button" onClick={deleteSelected}>删除</button></div>
                <button className="manga-recognize-region" type="button" disabled={!BACKEND_ENABLED || busy !== null} onClick={() => recognizeRegion(selected)}>{BACKEND_ENABLED ? (busy === "region" ? "正在识别当前框…" : "◎ 识别当前框内文字") : "◎ OCR 暂未启用"}</button>
                <label>原文<textarea rows={4} value={selected.sourceText} placeholder="输入或校对识别出的原文" onChange={(event) => updateSelected({ sourceText: event.target.value })} /></label>
                <label>中文译文<textarea rows={4} value={selected.translatedText} placeholder="输入或修改中文译文" onChange={(event) => updateSelected({ translatedText: event.target.value })} /></label>
                <div className="manga-field-row">
                  <label>排版方向<select value={selected.direction} onChange={(event) => updateSelected({ direction: event.target.value as RegionDirection })}><option value="horizontal">横排</option><option value="vertical">竖排</option></select></label>
                  <label>字号提示<input type="text" value={selected.width < 0.2 ? "小" : "标准"} readOnly /></label>
                </div>
                <div className="manga-coordinate-note">位置 {Math.round(selected.x * 100)}%, {Math.round(selected.y * 100)}% · 尺寸 {Math.round(selected.width * 100)}% × {Math.round(selected.height * 100)}%</div>
              </>
            ) : (
              <div className="manga-no-selection"><span>↖</span><strong>选择一个文字框</strong><p>点击画布上的框或右侧列表后，可以逐条校对原文与译文。</p></div>
            )}
          </div>
        </aside>
      </section>

      <footer className="manga-tool-footer"><span>纯前端原型 · 图片仅在当前浏览器中处理</span><span>手动框选 → 填写原文 → 编辑译文 → 导出标注</span></footer>
    </main>
  );
}
