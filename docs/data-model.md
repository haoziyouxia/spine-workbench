# Data Model - Spine Workbench v1

## 1. 目标
定义第一版最小数据结构，保证导入、编辑、导出这条链路能跑通。

## 2. 顶层对象

### Project
表示一个角色处理项目。

建议字段：
- `id`
- `name`
- `sourceImagePath`
- `status`
- `createdAt`
- `updatedAt`
- `parts`
- `bones`
- `notes`

## 3. Part
表示拆件后的一个部件。

建议字段：
- `id`
- `name`
- `type`
- `imagePath`
- `bbox`
- `zIndex`
- `visible`
- `locked`
- `parentPartId`

### bbox
建议结构：
- `x`
- `y`
- `width`
- `height`

## 4. Bone
表示一个骨点或骨骼节点。

建议字段：
- `id`
- `name`
- `x`
- `y`
- `parentBoneId`
- `linkedPartIds`
- `visible`

## 5. Note
表示人工备注或问题记录。

建议字段：
- `id`
- `type`
- `message`
- `relatedPartId`
- `relatedBoneId`

## 6. Status 建议值
- `draft`
- `image_imported`
- `parts_suggested`
- `parts_reviewed`
- `bones_suggested`
- `bones_reviewed`
- `exported`

## 7. 第一版原则
- 数据结构简单
- JSON 可读
- 方便手动检查
- 方便后续版本扩展

## 8. 暂不纳入
- 高级蒙皮信息
- 动画时间线
- 复杂约束系统
- 多版本协作信息
