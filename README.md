# 作业预览 · 苹果拟物（Aurora · Ocean 背景）

单纯静态站点，直接丢到 GitHub Pages 就能跑。包含：
- 液态玻璃时间卡片、学科任务卡片
- 勾选动画：删除线纯黑，随进度平滑推进；文字同步渐隐
- 甜甜圈进度环
- 全部勾完触发“离子消除”并显示「今日任务已完成，请好好休息。」
- 流动背景采用 **线性渐变位移 + 模糊** 的 Aurora Ocean 配色（抗闪烁优化）

## 使用
1. 编辑 `app.js` 里的 `DATA`，填你当天各学科作业。
2. 可在 `styles.css` 中调整：
   - 背景速度：`@keyframes auroraX / auroraY` 的时长或 `.liquid-bg::before/::after` 上的 `animation` 时长。
   - 玻璃强度：`backdrop-filter: blur(16px) saturate(160%)`。
   - 主题色：`--c1 ~ --c4` / `--accent`。

## 本地预览
直接双击 `index.html` 或开一个本地静态服务器（可选）：
```bash
python3 -m http.server 5173
```

## 部署到 GitHub Pages
1. 新建仓库（Public 或 Private 均可）。
2. 上传这四个文件：`index.html`, `styles.css`, `app.js`, `.nojekyll`（必须）和 `README.md`。
3. 仓库设置（Settings） → Pages → Source 选择 `Deploy from a branch`，Branch 选 `main / (root)`。
4. 等 30 秒左右，访问 Pages 提供的 URL 即可。

> 说明：`.nojekyll` 用来禁止 Jekyll 处理，避免某些静态资源被忽略。
