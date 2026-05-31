# trae-task-080-export-readiness-hidden-info-reveal-affordance

## 任务概述
若 079 后仍存在被压缩信息较难察觉的问题，本章继续补一层轻量 reveal affordance，让用户知道还有哪些信息被折叠，而不是只能被动忽略。

## 任务目标
1. 为被压缩的信息提供更自然的显露线索
2. 保持 affordance 轻，不做复杂展开面板
3. 不引入复杂交互系统

## 实现要求
1. affordance 要克制，不抢主状态区
2. 重点解决"我不知道还有东西被藏了"
3. 保持 064-079 一致性

## 验收标准
- 用户知道有信息被隐藏
- 提示不干扰主状态区
- 保持轻量，不引入复杂系统

## 实现方案

### 核心思路
为被隐藏的信息添加轻量的显露线索，让用户知道有更多信息可用。

### 具体实现
- 使用微妙的视觉提示表明有隐藏内容
- 添加 hover 效果显示更多信息
- 保持极简，不引入复杂交互

## 交付结果

### 修改文件
1. `app/src/renderer/components/ExportPreview.tsx` - 添加显露线索
2. `app/src/renderer/index.css` - 添加线索样式
3. `tasks/trae-task-080-export-readiness-hidden-info-reveal-affordance.md` - 任务文件

### 验证方法
1. 在 `app/` 目录运行 `npm run build` 确认构建成功
2. 调整浏览器宽度到极窄（420px 以下）
3. 验证用户能感知到有隐藏信息
4. 验证提示不干扰主状态区