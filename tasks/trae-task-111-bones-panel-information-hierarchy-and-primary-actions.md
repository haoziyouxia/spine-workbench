# trae-task-111-bones-panel-information-hierarchy-and-primary-actions

## 任务概述
ExportPreview 整页已冻结后，下一条主线切到骨骼编辑阶段的侧栏体验。先收口 `PropertyPanel` 在 `bones` 步骤下的上半区，让“骨骼工具 / 骨骼列表 / 当前选择状态”之间的层级更清楚，避免用户进入骨点调整后第一眼不知道该先做什么。

## 任务目标
1. 梳理 bones 步骤侧栏的主信息层级与首要动作顺序
2. 让“未选中骨骼”和“已选中骨骼”两种状态的侧栏节奏更自然
3. 保持范围仅限 `PropertyPanel` / `BonesPanel` / 相关样式，不扩展到 ExportPreview 或其他步骤

## 实现要求
1. 优先处理骨骼工具区、骨骼列表区、提示区之间的顺序、标题密度、间距与强调关系
2. 不重做骨骼功能逻辑；本章以结构、文案、样式和轻量交互引导为主
3. 回写时必须说明：进入 bones 步骤后，用户第一眼应该先看哪里、先做什么
4. 每次回写继续提供真实 `Files Changed`、真实 `git status --short`、真实 `git log -1 --stat` 和真实验证动作
