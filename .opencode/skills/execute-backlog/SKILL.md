# Execute Backlog Skill

Execute pending remediation tasks from a markdown backlog file one by one until completion.

## When to Use

Use this skill when the user provides a backlog file (like `docs/tracking/code-review-audit-backlog.md`) and says to fix the pending items, execute the backlog, or work through the task list.

## Workflow

### Step 0 — Load & Parse
1. Read the backlog file the user specified (default: `docs/tracking/code-review-audit-backlog.md`).
2. Identify the first task whose status (in either the detailed section or summary table) indicates it is pending — `Discovered`, `[To Do]`, `[Pending]`, or no completion marker.
3. **Also pick up deferred items:** If no pending items remain, scan for `⏳ [Deferred — ...]` items. These are revisited because the codebase may have changed since deferral.

### Step 1 — Deferred Item Re-evaluation
If the task was previously deferred (status contains `Deferred`), re-evaluate the deferral reason against current code:

1. Read the source file(s) referenced in the task.
2. **Reason no longer valid?** If the concern that caused deferral is gone (e.g., the 5+ file refactor was already done, the blocking dependency was resolved, the complexity was reduced by prior work), clear the deferred status and proceed to Step 2 as if it were a new `Discovered` item.
3. **Reason still valid?** If the concern persists, update the deferral note with any new context you gathered (e.g., "Still requires 6 file changes — refactoring X first would reduce scope"), keep it `⏳ [Deferred]`, and **loop back to Step 0** to try the next item.
4. **Unsure?** If you cannot determine whether the reason is still valid, keep it deferred and move on.

### Step 2 — Mark In Progress
Update the task's status in the summary table row from `Discovered` to `In Progress`.

### Step 3 — Staleness Check (Always Run)
Backlog items may be stale — code may have been improved since the issue was logged. **Always verify against current code before acting.**

1. Read the actual source file(s) referenced in the task.
2. **Issue no longer exists?** If the described problem is gone (code was refactored, fixed in a prior sprint, etc.), mark the task `✅ [Skipped — Not Valid Anymore]` and loop to Step 0.
3. **Pointers stale but issue persists?** If the issue still exists but the `Pointers to Solve` reference old file paths, renamed functions, or outdated patterns, **discover the current fix** by reading the recent code. Update the pointers mentally, then proceed to Step 5 with the corrected approach.
4. **Issue and pointers both current?** Proceed to Step 4.

### Step 4 — Size Check
If implementing the fix requires modifying 5+ files at once without intermediate steps, mark it `⏳ [Deferred — Too Big]` and loop back to Step 0. Do not attempt massive refactors — they belong in a separate planning phase.

### Step 5 — Fix It
Write code to resolve the issue. Follow the project's existing code conventions, style, and patterns. Use the `**Pointers to Solve**` section from the task as guidance.

**The "Never Stop" Rule:** If you get stuck — cannot find a file, code doesn't compile, or you hit a conceptual blocker — revert your changes, mark the task `🛑 [Blocked — <reason>]`, and **immediately** loop to Step 0. Do NOT stop to ask the user questions.

### Step 6 — Update Tracker
1. In the detailed section, append a note: `*Files modified: <comma-separated list of changed files>*`.
2. In the summary table, change `In Progress` to `✅ [Completed]`.
3. Save the backlog file.

### Step 7 — Loop
Go directly back to Step 0. Do not wait for user confirmation. Do not summarize unless explicitly asked.

## Hard Rules
- Only fix ONE task at a time.
- Never break the markdown table format (`|` columns, alignment).
- If you run out of token/memory budget, stop and output: *"Stopping safely. Start next agent at Task ID [<last attempted ID>]."*
- Do not modify any file outside the scope of the current task.
- Do not create new files unless explicitly called for by the fix.
- Revert all changes on a blocked task before moving on.
