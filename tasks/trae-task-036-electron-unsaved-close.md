# Trae Task 036 - Electron Native Unsaved Close Handling

## 背景
当前未保存提醒主要依赖浏览器式 beforeunload。Spine Workbench 是桌面工具，下一步需要更贴近 Electron 的关闭流程。

## 本次任务目标
尝试将未保存提醒更靠近 Electron 原生窗口关闭处理。

## 本次只做这些
1. 调研并实现 Electron 窗口关闭时的基础未保存拦截方案
2. 在可行范围内改进当前关闭提醒体验
3. 保持与现有 dirty state 逻辑兼容
4. 若受当前架构限制，明确记录限制和建议后续方案

## 要求
- 不要大改整体架构
- 第一版优先求稳
- 如果不能完全原生实现，也要把限制讲清楚

## 验收标准
- Electron 环境下关闭提醒比当前更贴近桌面应用体验，或限制被明确验证
- 不破坏现有保存状态逻辑
