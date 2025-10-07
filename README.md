# 作业预览

静态 GitHub Pages 应用，用于展示与勾选每日作业进度。

## 运行
直接在支持 ES Modules 的浏览器中打开 `index.html` 即可。

## 目录结构
```
assets/
  └─ styles/                  # 主题变量、基础布局与组件样式
src/
  ├─ main.js                  # 入口，加载核心应用
  ├─ core/                    # 应用装配与页面级逻辑
  ├─ modules/clock/           # 时间显示模块
  ├─ modules/progress/        # 甜甜圈进度组件
  ├─ modules/homework/        # 作业面板（数据/状态/渲染/排序）
  ├─ animations/              # 通用动画辅助
  └─ shared/                  # 共享工具（DOM 助手、防抖）
```

## 二次开发
作业数据位于 `src/modules/homework/data.js`，可直接编辑以调整内容。
修改 `src/modules/homework/*` 可独立定制作业 UI 与交互；入口逻辑位于 `src/core/app.js`。
使用 `npm run lint` 可运行 ESLint 与 Stylelint。
