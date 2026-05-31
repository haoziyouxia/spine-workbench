# Spine Workbench

一个面向生产流程的 Spine 辅助工具项目。

当前目标不是一键完美生成 Spine 成品，而是先做一个可落地的第一版：

- 输入单张角色图
- 自动做拆件辅助
- 在关键步骤允许人工修正
- 输出可供 Spine 继续编辑的标准化结果

## 目录

- `docs/` 产品与技术文档
- `samples/` 测试素材
- `exports/` 导出结果
- `tasks/` 可分派给 Trae 或其他执行者的任务单
- `notes/` 项目随手记录
- `app/` 代码
- `tests/` 测试

## CLI 工作流（Taskfile）

项目根目录已提供 `Taskfile.yml`，可把常用操作当作统一 CLI 执行：

- `task install`：安装 `app/` 依赖
- `task build`：构建应用
- `task dev`：开发模式
- `task start`：构建并启动
- `task check`：快速检查（build gate）

> 若本机未安装 task，可先安装 go-task（Taskfile 官方 CLI）。
