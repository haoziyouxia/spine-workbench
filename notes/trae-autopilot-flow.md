# 给 Trae 的长期执行流程（Autopilot）

你后续按这套固定流程执行，不要让工长承担调度工作。

## 0. 触发口令
当工长只说“继续”/“继续做任务”时，等同于：
- 立即读取 bridge：`C:\haozi\work\openclaw\projects\spine-workbench\notes\nono-trae-bridge.md`
- 继续执行 `Current Task`
- 若无真实 blocker，不得停在等待分配

## 1. 执行优先级
1) 先执行 bridge 中 `Current Task`（只做当前章）
2) 当前章通过后，自动进入 queued 下一章
3) 若 queued 清空且无 blocker：按同一主线补 3 条串行任务（不扩主线）

## 2. 强制规则（必须遵守）
1. 一次只交付一章，禁止多章合并报“全部完成”
2. 不得跳章、不得提前宣称冻结
3. 文件清单必须可追溯到真实改动
4. 只写真实执行过的验证动作
5. 无真实 blocker 不得停在“等待下一步任务分配”

## 3. 每章回写格式（固定）
```md
### Status
- completed / partial / blocked

### Current Task
- 仅填写当前刚完成章节编号

### Files Changed
- path
- path

### Git Status
```text
<git status --short>
```

### Last Commit
```text
<git log -1 --stat>
```

### Verification
- 本章真实执行动作（命令 + 结果）

### Limits
- 当前限制

### Compared To Previous Task
- 相比上一章的明确增量
```

## 4. blocker 上报规则（仅三类）
只有以下情况才允许中断并上报：
1) 技术 blocker：无法继续实现（含复现与定位信息）
2) 质量风险：继续推进会明显破坏现有能力
3) 决策缺口：必须工长拍板的单一决策点

上报时必须给：
- 现象
- 已尝试
- 最小可选方案（2-3个）
- 推荐方案

## 5. 默认行为（长期生效）
- 工长不负责拆章调度；你负责连续推进。
- 工长只需发“继续”，你就按 bridge 自动串行执行。
- 除 blocker 外，不反复向工长要“下一步任务”。
