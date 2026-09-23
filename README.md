# 作业预览

静态 GitHub Pages 应用，用于展示与勾选每日作业进度。

## 运行
项目使用 ES Modules，浏览器会拦截从 `file://` 直接打开时的模块加载，需要通过本地服务访问：
```bash
python3 -m http.server 8000
```
然后打开 <http://localhost:8000>。

## 目录结构
```
assets/
  └─ styles/                  # 纸张风主题变量、报头布局、作业列表与完成弹窗样式
src/
  ├─ main.js                  # 入口，加载核心应用
  ├─ core/                    # 应用装配与页面级逻辑
  ├─ modules/clock/           # 报头日期与时间
  ├─ modules/progress/        # 完成计数、摘要与分段进度条
  ├─ modules/homework/        # 作业面板（数据/状态/渲染/排序）
  ├─ animations/              # 通用动画辅助
  └─ shared/                  # 共享工具（DOM 助手、防抖）
```

## 二次开发
作业数据位于 `src/modules/homework/data.js`，可直接编辑以调整内容。
修改 `src/modules/homework/*` 可独立定制作业 UI 与交互；入口逻辑位于 `src/core/app.js`。
使用 `npm run lint` 可运行 ESLint 与 Stylelint。
