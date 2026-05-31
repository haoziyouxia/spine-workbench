# How To Command Trae

## 目标
让 Trae 按顺序执行明确任务，减少跑偏、过度发挥和返工。

## 核心原则
- 一次只做一个任务
- 严格按任务单执行
- 不主动扩展需求
- 不擅自修改技术路线
- 每完成一步都要汇报结果

## 推荐命令模板
请阅读 `C:\haozi\work\openclaw\projects\spine-workbench` 下的 `docs` 和 `tasks` 文档。

然后严格按任务单顺序执行，先从 `trae-task-001-project-scaffold.md` 开始。

执行规则：
- 一次只完成一个任务
- 不要主动实现任务单之外的功能
- 不要擅自修改技术路线
- 如果当前任务依赖缺失或存在冲突，先停下来说明问题
- 每完成一个任务后，输出：
  - 改了哪些文件
  - 实现了什么
  - 如何运行/验证
  - 还有什么未完成

先完成 task 001，完成后再继续下一个。

## 推荐任务顺序
1. `trae-task-001-project-scaffold.md`
2. `trae-task-002-image-import-preview.md`
3. `trae-task-003-basic-editor-layout.md`
4. `trae-task-004-parts-panel-prototype.md`
5. `trae-task-005-bone-point-editor-prototype.md`

## 什么任务适合给 Trae
- 脚手架初始化
- 基础 UI 页面
- 图片导入与预览
- 面板原型
- mock 数据驱动的交互原型
- 明确边界内的小型重构

## 什么任务不适合直接丢给 Trae
- 整个产品方向设计
- 技术路线拍板
- 大范围自由发挥
- 没有验收标准的模糊任务
- 需要高层权衡的架构决策

## Trae 完成后怎么处理
- 先看它改了哪些文件
- 再看是否严格符合当前任务单
- 再确认是否可运行
- 如果它额外做了未授权功能，要单独标出来，不直接默认接受

## 一句话策略
让 Trae 负责执行，让闪电负责拆解、约束和验收。
