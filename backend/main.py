from __future__ import annotations

import base64
import binascii
import io
import shutil
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from PIL import Image, ImageFilter, ImageOps

try:
    import pytesseract
    from pytesseract import Output
except ImportError:  # The region detector still works without Tesseract.
    pytesseract = None
    Output = None


MAX_IMAGE_BYTES = 12 * 1024 * 1024
MAX_ANALYSIS_EDGE = 1100

app = FastAPI(
    title="奇想书桌 · 漫画文字翻译 API",
    version="0.1.0",
    description="漫画图片文字区域检测、OCR 与原型翻译接口。",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3003",
        "http://127.0.0.1:3003",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class OCRRequest(BaseModel):
    image_data: str = Field(description="data:image/...;base64,... 格式的图片")
    language: str = "eng"
    direction: Literal["auto", "horizontal", "vertical"] = "auto"
    scope: Literal["page", "region"] = "page"


class TranslateRequest(BaseModel):
    texts: list[str]
    source_language: str = "ja"
    target_language: str = "zh-CN"


class Region(BaseModel):
    id: str
    x: float
    y: float
    width: float
    height: float
    source_text: str = ""
    confidence: float = 0
    direction: Literal["horizontal", "vertical"] = "horizontal"


def decode_image(image_data: str) -> Image.Image:
    if not image_data.startswith("data:image/") or ";base64," not in image_data:
        raise HTTPException(status_code=400, detail="请上传 base64 编码的图片。")

    encoded = image_data.split(",", 1)[1]
    try:
        raw = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise HTTPException(status_code=400, detail="图片数据格式不正确。") from exc

    if len(raw) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="图片不能超过 12MB。")

    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
        return ImageOps.exif_transpose(image).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="无法读取这张图片。") from exc


def normalized_region(
    region_id: str,
    box: tuple[int, int, int, int],
    image_size: tuple[int, int],
    text: str = "",
    confidence: float = 0,
    direction: Literal["horizontal", "vertical"] = "horizontal",
) -> Region:
    left, top, right, bottom = box
    image_width, image_height = image_size
    return Region(
        id=region_id,
        x=round(left / image_width, 6),
        y=round(top / image_height, 6),
        width=round((right - left) / image_width, 6),
        height=round((bottom - top) / image_height, 6),
        source_text=text.strip(),
        confidence=round(max(0, confidence), 2),
        direction=direction,
    )


def tesseract_regions(image: Image.Image, language: str, scope: str = "page") -> list[Region]:
    if pytesseract is None or Output is None or not shutil.which("tesseract"):
        return []

    modes = [7] if scope == "region" else [11, 6]
    for page_segmentation_mode in modes:
        try:
            data = pytesseract.image_to_data(
                image,
                lang=language,
                config=f"--psm {page_segmentation_mode}",
                output_type=Output.DICT,
            )
        except Exception:
            continue

        regions: list[Region] = []
        image_size = image.size
        for index, raw_text in enumerate(data.get("text", [])):
            text = raw_text.strip()
            try:
                confidence = float(data["conf"][index])
            except (TypeError, ValueError, KeyError):
                confidence = 0
            if not text or confidence < 18:
                continue

            left = int(data["left"][index])
            top = int(data["top"][index])
            width = int(data["width"][index])
            height = int(data["height"][index])
            if width < 4 or height < 4:
                continue
            direction: Literal["horizontal", "vertical"] = "vertical" if height > width * 1.8 else "horizontal"
            regions.append(
                normalized_region(
                    f"ocr-{index + 1}",
                    (left, top, left + width, top + height),
                    image_size,
                    text,
                    confidence,
                    direction,
                )
            )
        if regions:
            return regions[:80]
    return []


def _connected_boxes(mask: Image.Image) -> list[tuple[int, int, int, int]]:
    """Find connected components in a small binary image without OpenCV."""
    width, height = mask.size
    pixels = mask.load()
    visited = bytearray(width * height)
    boxes: list[tuple[int, int, int, int]] = []

    for y in range(height):
        for x in range(width):
            offset = y * width + x
            if visited[offset] or pixels[x, y] == 0:
                continue

            stack = [(x, y)]
            visited[offset] = 1
            min_x = max_x = x
            min_y = max_y = y
            count = 0

            while stack:
                current_x, current_y = stack.pop()
                count += 1
                min_x = min(min_x, current_x)
                max_x = max(max_x, current_x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)

                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_offset = next_y * width + next_x
                    if visited[next_offset] or pixels[next_x, next_y] == 0:
                        continue
                    visited[next_offset] = 1
                    stack.append((next_x, next_y))

            component_width = max_x - min_x + 1
            component_height = max_y - min_y + 1
            if count >= 12 and component_width >= 7 and component_height >= 4:
                boxes.append((min_x, min_y, max_x + 1, max_y + 1))

    return boxes


def visual_text_regions(image: Image.Image, direction: str) -> list[Region]:
    """Roughly group high-contrast marks into editable text candidates.

    This fallback detects likely regions but intentionally does not claim to OCR them.
    """
    working = image.copy()
    ratio = min(1.0, MAX_ANALYSIS_EDGE / max(working.size))
    if ratio < 1:
        working = working.resize(
            (max(1, round(working.width * ratio)), max(1, round(working.height * ratio))),
            Image.Resampling.LANCZOS,
        )

    gray = ImageOps.autocontrast(ImageOps.grayscale(working))
    dark_ink = gray.point(lambda value: 255 if value < 118 else 0)

    if direction == "vertical":
        joined = dark_ink.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MaxFilter(11))
    else:
        joined = dark_ink.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MaxFilter(5))

    boxes = _connected_boxes(joined)
    scale_x = image.width / working.width
    scale_y = image.height / working.height
    candidates: list[tuple[int, int, int, int]] = []

    for left, top, right, bottom in boxes:
        box_width = right - left
        box_height = bottom - top
        area_ratio = (box_width * box_height) / (working.width * working.height)
        if area_ratio < 0.00018 or area_ratio > 0.18:
            continue
        if box_width < 10 or box_height < 7:
            continue
        padding = max(3, round(min(box_width, box_height) * 0.18))
        candidates.append(
            (
                max(0, round((left - padding) * scale_x)),
                max(0, round((top - padding) * scale_y)),
                min(image.width, round((right + padding) * scale_x)),
                min(image.height, round((bottom + padding) * scale_y)),
            )
        )

    candidates.sort(key=lambda item: (item[1], item[0]))
    regions: list[Region] = []
    for index, box in enumerate(candidates[:36]):
        box_width = box[2] - box[0]
        box_height = box[3] - box[1]
        inferred: Literal["horizontal", "vertical"] = "vertical" if box_height > box_width * 1.4 else "horizontal"
        regions.append(normalized_region(f"detected-{index + 1}", box, image.size, direction=inferred))
    return regions


DEMO_DICTIONARY = {
    "今日も冒険へ": "今天也去冒险吧",
    "こんにちは": "你好",
    "ありがとう": "谢谢",
    "大丈夫": "没关系",
    "行こう": "走吧",
    "待って": "等等",
    "すごい": "好厉害",
    "猫": "猫",
    "冒険": "冒险",
    "今日": "今天",
    "明日": "明天",
}


def demo_translate(text: str) -> str:
    clean = text.strip()
    if not clean:
        return ""
    translated = clean
    matched = False
    for source, target in DEMO_DICTIONARY.items():
        if source in translated:
            translated = translated.replace(source, target)
            matched = True
    return translated if matched else f"（待校对）{clean}"


@app.get("/api/health")
def health() -> dict:
    tesseract_available = bool(pytesseract is not None and shutil.which("tesseract"))
    languages: list[str] = []
    if tesseract_available:
        try:
            languages = list(pytesseract.get_languages(config=""))
        except Exception:
            languages = []
    return {
        "ok": True,
        "ocr": "tesseract" if tesseract_available else "region-detector",
        "ocr_languages": languages,
        "translation": "demo",
        "message": "服务已就绪" if tesseract_available else "服务已就绪；当前仅检测文字区域，OCR 需安装 Tesseract。",
    }


@app.post("/api/ocr")
def ocr(request: OCRRequest) -> dict:
    image = decode_image(request.image_data)
    regions = tesseract_regions(image, request.language, request.scope)
    engine = "tesseract"
    warning = None

    if not regions:
        regions = visual_text_regions(image, request.direction)
        engine = "region-detector"
        warning = "未检测到可用 OCR 引擎或文字结果，已改用视觉区域检测；请手动补充原文。"

    return {
        "regions": [region.model_dump() for region in regions],
        "engine": engine,
        "warning": warning,
        "image": {"width": image.width, "height": image.height},
    }


@app.post("/api/translate")
def translate(request: TranslateRequest) -> dict:
    return {
        "translations": [demo_translate(text) for text in request.texts],
        "mode": "demo",
        "warning": "当前使用本地演示词典；接入正式翻译模型后可替换此接口实现。",
    }


@app.get("/")
def root() -> dict:
    return {"name": app.title, "docs": "/docs", "health": "/api/health"}
