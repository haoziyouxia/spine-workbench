# trae-task-114-bones-sidebar-phase-a-scope-lock-and-acceptance-baseline

## 阶段目标
以“可验收、可量化”为前提，完成 bones 侧栏阶段A：收敛改动范围、建立验收基线，避免继续被历史 carry-over 干扰。

## 本章范围（仅限）
- `app/src/renderer/components/PropertyPanel.tsx`
- `app/src/renderer/components/BonesPanel.tsx`
- `app/src/renderer/components/BoneDetail.tsx`
- `app/src/renderer/index.css`
- `notes/nono-trae-bridge.md`

## 量化验收标准
1. 回写时 `Current Task` 必须为 **114**。
2. `Files Changed` 与 `git status --short` 对齐，且**不再出现范围外“新增本章改动”描述**。
3. 提供一份“阶段A基线清单”，至少包含：
   - 3 个主区域（工具区/骨骼列表/详情区）
   - 每个区域 2 条当前行为描述（共≥6条）
4. 在 `app/` 目录执行 `npm run build` 并记录结果（成功/失败）。

## 交付物
- 合规的 114 单章回写
- 阶段A基线清单（可直接贴在 Verification 或附录）
