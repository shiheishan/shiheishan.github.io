# 模块关系

```
index.html
  └─ src/app.js 入口
      ├─ src/clock.js            # 刷新时刻渲染
      ├─ src/donut/              # 甜甜圈进度动画
      └─ src/hw-panel/           # 作业板块（数据/状态/渲染/排序）
          ├─ data.js             # 默认作业数据
          ├─ state.js            # 状态与进度计算
          ├─ render.js           # DOM 渲染
          ├─ sort.js             # 稳定排序
          └─ index.js            # 对外 API
      ├─ src/anim/flip.js        # FLIP 排序动画
      └─ src/utils/dom.js        # DOM 与防抖工具
```

## 数据流
1. `data.js` 提供初始作业列表；`state.js` 保存学科与任务勾选状态，并提供 `selectProgress()` 计算完成度。
2. `index.js` 监听勾选变化，更新状态并通过 `onProgress(percent)` 回调通知外层。
3. `app.js` 将进度传递给 `donut` 模块并在 100% 时触发庆祝动画。

## API 示例
```js
import { initHwPanel } from './src/hw-panel/index.js';

const api = initHwPanel({
  mount: document.getElementById('subjects'),
  onProgress: pct => console.log(pct)
});
// api.addSubject(...), api.removeSubject(id) 等
```
