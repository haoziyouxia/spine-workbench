# Trae Task 016 - Part Export Alignment

## 背景
当前 part 数据已经逐步从 mock 转向真实创建和编辑。下一步需要确保 part 数据在导出中的表达更完整、更一致。

## 本次任务目标
让 part 相关数据在导出结构中得到更准确的体现，并与当前编辑状态保持一致。

## 本次只做这些
1. 检查并完善 part 数据在导出中的映射
2. 确保至少导出这些字段：
   - id
   - name
   - type
   - bbox
   - zIndex
   - visible
3. 在 `hierarchy.json` 或合适位置清楚表达 part 的顺序和基础结构
4. 如果存在手动创建的 part，导出结果中必须真实反映
5. 与保存/加载结构尽量保持一致

## 要求
- 不要做复杂格式设计
- 重点是清楚、稳定、一致
- 与现有 docs/export-format.md 尽量对齐

## 验收标准
- 导出的 part 数据能反映当前编辑器中的真实 part 状态
- bbox、zIndex、visible 等关键信息不丢失
- hierarchy 结构可读、可检查
