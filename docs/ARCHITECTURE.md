# 模块关系

```
index.html
  └─ src/main.js              # 入口，加载核心应用
      └─ src/core/app.js      # 挂载 UI、协调模块
          ├─ src/modules/clock/       # 时间展示
          ├─ src/modules/progress/    # 甜甜圈进度动画
          ├─ src/modules/homework/    # 作业面板（数据/状态/渲染/排序）
          │    ├─ data.js             # 默认作业数据
          │    ├─ state.js            # 状态与进度计算
          │    ├─ render.js           # DOM 渲染
          │    ├─ sort.js             # 稳定排序
          │    └─ index.js            # 对外 API
          ├─ src/animations/flip.js   # FLIP 排序与高度动画
          └─ src/shared/dom.js        # DOM 与防抖工具
assets/
  └─ styles/                  # 主题、基础布局、组件样式
```

## 数据流
1. `data.js` 提供初始作业列表；`state.js` 保存学科与任务勾选状态，并提供 `selectProgress()` 计算完成度。
2. `index.js` 监听勾选变化，更新状态并通过 `onProgress(percent)` 回调通知外层。
3. `app.js` 将进度传递给 `progress` 模块并在 100% 时触发庆祝动画。

## API 示例
```js
import { initHwPanel } from './src/modules/homework/index.js';

const api = initHwPanel({
  mount: document.getElementById('subjects'),
  onProgress: pct => console.log(pct)
});
// api.addSubject(...), api.removeSubject(id) 等
```
