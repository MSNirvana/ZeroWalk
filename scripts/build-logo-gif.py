#!/usr/bin/env python3
"""从 Logo.mov 生成透明背景导航 GIF（需 Pillow + av）。"""
from __future__ import annotations

import sys
from pathlib import Path

import av
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SRC = Path("/Users/gaoyunhong/Desktop/第零漫步/Logo/Logo.mov")
OUT_GIF = ROOT / "assets" / "logo-anim.gif"
OUT_PNG = ROOT / "assets" / "logo-nav.png"

# 2× 导出，CSS 缩到 36px 时边缘更干净
TARGET_HEIGHT = 144
FRAME_STEP = 2
BG_CUTOFF = 238
EDGE_LOW = 210


def polish_frame(img: Image.Image) -> Image.Image:
    """抠图并压成纯黑 + 干净透明，减少 GIF 半透明噪点。"""
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    alpha = np.zeros(lum.shape, dtype=np.float32)
    alpha[lum <= EDGE_LOW] = 255.0
    edge = (lum > EDGE_LOW) & (lum < BG_CUTOFF)
    alpha[edge] = (BG_CUTOFF - lum[edge]) / (BG_CUTOFF - EDGE_LOW) * 255.0

    alpha_img = Image.fromarray(alpha.astype(np.uint8), mode="L")
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.8))
    alpha = np.array(alpha_img, dtype=np.float32)

    # 收窄半透明带，避免 GIF 抖动毛刺
    alpha[alpha < 48] = 0
    alpha[alpha > 200] = 255
    alpha = np.clip(alpha, 0, 255).astype(np.uint8)

    out = np.zeros_like(arr, dtype=np.uint8)
    out[:, :, 3] = alpha
    fg = alpha >= 128
    out[fg, 0:3] = 0
    return Image.fromarray(out, mode="RGBA")


def resize_frame(img: Image.Image) -> Image.Image:
    w, h = img.size
    scale = TARGET_HEIGHT / h
    new_w = max(1, int(round(w * scale)))
    return img.resize((new_w, TARGET_HEIGHT), Image.Resampling.LANCZOS)


def rgba_to_indexed(im: Image.Image) -> Image.Image:
    """双色 GIF：索引 0 透明，索引 1 纯黑，无抖动。"""
    im = im.convert("RGBA")
    w, h = im.size
    alpha = np.array(im.split()[3], dtype=np.uint8)
    # 轻微羽化后硬切，边缘只有 1px 过渡
    data = np.where(alpha >= 100, 1, 0).astype(np.uint8)
    out = Image.new("P", (w, h))
    out.putdata(data.tobytes())
    palette = [0, 0, 0, 0, 0, 0] + [0, 0, 0] * 254
    out.putpalette(palette)
    out.info["transparency"] = 0
    return out


def save_gif(frames: list[Image.Image], path: Path, duration_ms: int) -> None:
    indexed = [rgba_to_indexed(f) for f in frames]
    indexed[0].save(
        path,
        save_all=True,
        append_images=indexed[1:],
        duration=duration_ms,
        loop=0,
        disposal=2,
        optimize=True,
    )


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.is_file():
        print(f"源视频不存在: {src}", file=sys.stderr)
        return 1

    raw_frames: list[Image.Image] = []
    container = av.open(str(src))
    stream = container.streams.video[0]
    fps = float(stream.average_rate or 24)
    duration_ms = int(1000 / (fps / FRAME_STEP))

    for i, frame in enumerate(container.decode(stream)):
        if i % FRAME_STEP != 0:
            continue
        rgb = frame.to_ndarray(format="rgb24")
        raw_frames.append(resize_frame(Image.fromarray(rgb, mode="RGB")))
    container.close()

    if not raw_frames:
        print("未读取到任何帧", file=sys.stderr)
        return 1

    frames = [polish_frame(f) for f in raw_frames]

    OUT_GIF.parent.mkdir(parents=True, exist_ok=True)
    save_gif(frames, OUT_GIF, duration_ms)
    frames[0].save(OUT_PNG, optimize=True)
    print(f"GIF: {OUT_GIF} ({len(frames)} 帧, {frames[0].size[0]}×{frames[0].size[1]})")
    print(f"PNG: {OUT_PNG}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
