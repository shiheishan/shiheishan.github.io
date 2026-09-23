# 模块关系

```
index.html
  └─ src/main.js              # 入口，加载核心应用
      └─ src/core/app.js      # 挂载 UI、协调模块
          ├─ src/modules/clock/       # 日期时间展示（每分钟刷新）
          ├─ src/modules/progress/    # 完成计数（数字滚动）、摘要、吸顶分段进度条
          ├─ src/modules/homework/    # 作业面板（数据/状态/渲染/排序）
          │    ├─ data.js             # 默认作业数据
          │    ├─ state.js            # 状态与进度计算
          │    ├─ render.js           # DOM 渲染
          │    ├─ sort.js             # 稳定排序
          │    └─ index.js            # 对外 API
          ├─ src/animations/flip.js   # FLIP 排序动画
          └─ src/shared/dom.js        # DOM 与防抖工具
assets/
  └─ styles/
      ├─ theme/tokens.css     # 纸张/墨色/主题色、字体、缓动
      ├─ base/                # 重置、报头、进度条、页面容器
      └─ components/          # 作业列表（hw-panel）、完成弹窗（done）
```

## 数据流
1. `data.js` 提供初始作业列表；`state.js` 保存学科与任务勾选状态，并提供 `selectProgress()` 计算完成度。
2. `index.js` 监听勾选变化，更新状态并通过 `onProgress({ done, total, pct })` 回调通知外层；420ms 后把已完成的学科沉到底部。
3. `app.js` 将进度传递给 `progress` 模块；从未完成变为全部完成时，700ms 后弹出盖章弹窗（点返回、点遮罩或按 Esc 关闭），取消勾选后再次勾满会重新弹出。

## 修改作业
每天的作业内容直接编辑 `src/modules/homework/data.js`。`initHwPanel` 只接收挂载点和进度回调：
```js
import { initHwPanel } from './src/modules/homework/index.js';

initHwPanel({
  mount: document.getElementById('subjects'),
  onProgress: ({ done, total }) => console.log(done, total)
});
```
