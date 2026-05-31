# Export Format - Spine Workbench v1

## 1. 目标
第一版输出的是 Spine 制作就绪包，不承诺直接生成最终成熟 Spine 工程。

## 2. 导出目录建议

```text
exports/
  character-id/
    source/
      original.png
    parts/
      head.png
      torso.png
      upper_arm_l.png
      lower_arm_l.png
      hand_l.png
      upper_arm_r.png
      lower_arm_r.png
      hand_r.png
      upper_leg_l.png
      lower_leg_l.png
      foot_l.png
      upper_leg_r.png
      lower_leg_r.png
      foot_r.png
    data/
      manifest.json
      hierarchy.json
      bones.json
      notes.json
    preview/
      preview.png
```

## 3. 文件说明

### `source/original.png`
原始输入图片。

### `parts/`
拆分后的标准化部件图。

### `data/manifest.json`
描述导出包的总体信息，例如：
- characterId
- sourceFile
- exportTime
- version
- partList

### `data/hierarchy.json`
描述部件层级和显示顺序。

### `data/bones.json`
描述骨点、骨骼树、关节位置等草稿信息。

### `data/notes.json`
描述人工修正备注、未处理问题、后续建议。

## 4. 第一版输出原则
- 人类可读
- 结构清晰
- 方便后续手工检查
- 方便后续转换成其他格式

## 5. manifest.json 建议字段
- `projectName`
- `characterId`
- `sourceImage`
- `parts`
- `status`
- `createdAt`
- `updatedAt`

## 6. bones.json 建议字段
- `root`
- `bones`
- `joints`
- `suggestedSlots`
- `pose`

## 7. 第一版不做
- 不做复杂二进制导出
- 不做黑盒格式
- 不把所有信息塞进一个巨型文件
