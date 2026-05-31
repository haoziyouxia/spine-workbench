# trae-task-117-bones-canvas-phase-a-interaction-baseline-and-scope-lock

## 阶段目标
进入 bones 画布交互主线阶段A：锁定画布交互范围并建立可复现基线，避免后续验收继续受历史噪音影响。

## 范围
- `app/src/renderer/components/Canvas.tsx`
- `app/src/renderer/index.css`
- `notes/nono-trae-bridge.md`

## 量化验收
1. `Current Task` 必须为 117。
2. 提供 5 条画布交互基线（拖拽、选中、取消、骨点显示、连接线反馈）。
3. `Files Changed` 与 `git status --short` 对齐。
4. 在 `app/` 执行一次 `npm run build` 并记录结果。
