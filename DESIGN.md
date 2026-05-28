# DESIGN.md · 第零漫步 ZeroWalk

## Aesthetic Direction

**简约现代 + 绿色渐变** — 白底、大量留白、统一 Noto Sans SC 排版，绿色渐变作为品牌主色。无土黄、无纸张网格。

## Color Strategy

- 主色：绿色渐变 `oklch(45% 0.14 155)` → `oklch(72% 0.1 175)`
- 背景：冷白 `oklch(99% 0.004 155)`，交替区块 `oklch(97% 0.012 160)`
- 禁止：土黄、暖褐、纸张网格底纹

## Typography

- 全站 Noto Sans SC，标题 700 / 正文 400
- 中文标题不强制窄 ch 宽度，按 em 控制行宽
- 行高：标题 1.25–1.35，正文 1.65–1.75

## Motion

- 首屏 stagger fade-up
- 区块 scroll reveal（IntersectionObserver）
- Hero 背景光晕 drift 动画
- 流程卡片逐项 slide-in
