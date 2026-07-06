---
name: summarize-backlog
description: >
  Parse a markdown backlog file, calculate sprint metrics, and generate a
  deferred debt report. Use when asked to "summarize [file path]",
  "report on [file path]", "metrics for [file path]", or
  "what's left in [file path]". When "clean" is included (e.g. "summarize and clean [file path]"),
  also archive completed items to docs/tracking/archive/ and include archived count in metrics.
---

# Summarize Backlog

Parse markdown backlog tables, calculate sprint metrics, and report on deferred technical debt.

## Mode Detection

Check if the user's request includes the word **"clean"** (e.g., "summarize and clean", "clean summarize").

- **Without "clean":** Read-only report. Follow steps 1–3.
- **With "clean":** Read-only report + archive completed items. Follow steps 1–4.

## 1. Data Extraction

Open and read the provided markdown backlog file silently.

Identify all tables tracking tasks. Parse:
- **Sprint** column (Sprint 1, Sprint 2, Sprint 3, Sprint 4)
- **Status** column (Discovered, In Progress, Blocked, Completed, Deferred, Skipped, etc.)
- **Description** and **Pointers to Solve** columns (for deferred item analysis)

Also record:
- The file name (e.g., `code-review-audit-backlog.md`)
- The highest existing ID (e.g., `AUD-095`)

## 2. Sprint Metrics Matrix

Calculate the total count of issues grouped by Sprint and Status.

**Without "clean"** — output this table:

```markdown
| Sprint | Discovered / To Do | In Progress | Blocked | Completed | Deferred | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Sprint 1 | 2 | 1 | 0 | 5 | 0 | 8 |
| Sprint 2 | 4 | 0 | 1 | 2 | 1 | 8 |
| Sprint 3 | 1 | 0 | 0 | 3 | 2 | 6 |
| Sprint 4 | 0 | 0 | 0 | 1 | 1 | 2 |
| **Total** | **7** | **1** | **1** | **11** | **4** | **24** |
```

**With "clean"** — add an `Archived` column that counts items moved to archive in step 4:

```markdown
| Sprint | Discovered / To Do | In Progress | Blocked | Completed | Deferred | Archived | Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Sprint 1 | 2 | 1 | 0 | 0 | 0 | 5 | 8 |
| Sprint 2 | 4 | 0 | 1 | 0 | 1 | 2 | 8 |
| Sprint 3 | 1 | 0 | 0 | 0 | 2 | 3 | 6 |
| Sprint 4 | 0 | 0 | 0 | 0 | 1 | 1 | 2 |
| **Total** | **7** | **1** | **1** | **0** | **4** | **11** | **24** |
```

**Rules:**
- Column headers must match exactly (add `Archived` only in clean mode)
- Row labels: `Sprint 1`, `Sprint 2`, `Sprint 3`, `Sprint 4`, `**Total**`
- Numbers must be bold in the Total row
- The Total column = sum of all status columns for that sprint
- The Total row = sum of all sprint rows for that column
- If a status column has zero items across all sprints, still include it with `0` values
- Count `Skipped` items as `Completed` (they were evaluated and dismissed)
- Count items with no status or `Discovered` under `Discovered / To Do`
- In clean mode, `Completed` and `Skipped` items move to `Archived` column (Completed becomes 0 for those sprints)

## 3. Deferred Debt Report

Filter the backlog for every item where the status contains `Deferred`.

Under the heading `### ⏳ Deferred Items & Root Causes`, output a bulleted list:

```markdown
### ⏳ Deferred Items & Root Causes

- **AUD-092** — ~63 endpoints returning raw dicts instead of ApiResponse
  - **Why:** Scope too large — touches 15+ files across the entire API layer. Requires systematic file-by-file replacement with no intermediate milestones.

- **AUD-093** — 7 agents use procedural architecture without StateGraph
  - **Why:** High complexity refactor — each agent has unique logic requiring careful migration to TypedDict state + StateGraph compilation. No single agent can be migrated in isolation without updating callers.
```

**For each deferred item, include:**
- **ID:** The task ID from the backlog
- **Description:** Brief summary from the Description column
- **Why:** The exact reason for deferral. Extract from:
  1. Explicit notes in the task description or status field
  2. The Complexity/Impact ratings (High Complexity + any reason = likely scope concern)
  3. The Pointers to Solve (if they describe multi-step cross-file changes, that's the deferral reason)
  4. If no explicit reason exists, infer from context but mark as `*(inferred)*`

## 4. Archive Completed Items (Clean Mode Only)

**This step only runs when "clean" is in the user's request.**

### 4a. Identify items to archive
Collect every row where Status contains `Completed`, `Skipped`, or `✅`.

### 4b. Build archive content
From the collected rows, build a markdown archive file with:
- A header noting the source backlog, date, and count
- The full detail sections for each archived item (not just the table row — include the description, pointers, and any notes)
- Preserve the original formatting

### 4c. Write archive file
Write to `docs/tracking/archive/` using the naming pattern:
```
docs/tracking/archive/[original-filename-without-extension]-archived-[YYYY-MM-DD].md
```

Example: `code-review-audit-backlog.md` → `archive/code-review-audit-backlog-archived-2026-06-18.md`

### 4d. Strip completed items from source
Remove the archived rows from the backlog file's summary table and detail sections. Keep all other items (Discovered, In Progress, Blocked, Deferred) intact.

### 4e. Output confirmation
After archiving, print:
```
Archived [N] completed items to [archive-path]
Remaining: [M] items in [source-path]
```

### 4f. Remove source file if empty
If after stripping completed items the source backlog file has **zero remaining items** (all items are Archived, none with Discovered/In Progress/Blocked/Deferred status), **delete the source file** from `docs/tracking/` rather than leaving an empty stub.

Before deleting, verify that the archive file actually contains the archived items.

Output instead:
```
Archived [N] completed items to [archive-path]
No remaining items — deleted [source-path]
```

## Hard Rules

- **Default is read-only:** Without "clean", never edit the backlog file.
- **Mathematically accurate:** Numbers in the metrics matrix must exactly match the rows in the markdown file. Double-check sums before outputting.
- **No hallucinated reasons:** Base the "Why" strictly on notes, pointers, or context in the file. If uncertain, say `*(reason not explicitly stated — inferred from complexity)*`.
- **Handle edge cases:** If a sprint has zero items, include it with all zeros. If the file has no deferred items, output `No deferred items found.`
- **Archive preserves detail:** Archived items must include their full detail sections, not just table rows.
- **Source file integrity:** After clean mode, the source backlog must still be valid markdown with all non-completed items intact.
