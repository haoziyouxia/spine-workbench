# AUTOMATION-RULES

## Mandatory execution contract
1. Before any external progress reply, update `PROJECT-STATE.json` first.
2. Append one entry to `RUN-LOG.md` for every meaningful execution chunk.
3. If blocked, set `status=blocked` and write concrete blocker + required input.
4. If not blocked, always write next 1-3 actionable tasks in `next_tasks`.
5. When task direction/scope/priority changes, MUST log change before replying:
   - update `current_task`, `next_tasks`, `status`, `last_update`
   - append `RUN-LOG.md` entry: old->new, reason, effective time

## Reporting style
- Default concise updates.
- Escalate only when: real blocker, quality risk, or decision needed.

## Recovery rule (after restart/offline)
- Resume from `PROJECT-STATE.json` as source of truth.
- Use latest `RUN-LOG.md` entry to reconstruct context.
