# 作业预览

静态 GitHub Pages 应用，用于展示与勾选每日作业进度。

## 运行
直接在支持 ES Modules 的浏览器中打开 `index.html` 即可。

## 目录结构
```
css/            # 样式：base/layout/hw-panel/donut
src/            # 源码：入口、作业板块、甜甜圈、工具等
└─ hw-panel/    # 作业板块模块
└─ donut/       # 甜甜圈进度模块
└─ anim/        # FLIP 动画
└─ utils/       # DOM 与防抖工具
```

## 二次开发
修改 `src/hw-panel/*` 可独立定制作业 UI 与交互；入口逻辑位于 `src/app.js`。
使用 `npm run lint` 可运行 ESLint 与 Stylelint。
