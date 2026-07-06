---
name: code-audit-backlog
description: >
  Audit code for a specific focus area, find bugs and proactive improvements,
  assess difficulty/impact, and build a mathematically prioritized sprint-organized
  markdown backlog. Use when asked to "audit code for [FOCUS AREA]",
  "build backlog for [FOCUS AREA]", "review code for [FOCUS AREA]",
  or "scan codebase for [FOCUS AREA] issues". Produces a dated markdown file
  at ./docs/tracking/YYMMDD-[focus-area]-backlog.md with deduplication against
  existing backlogs.
---

# Code Audit Backlog

Systematic codebase audit that finds bugs and improvements for a focus area, then organizes them into a sprint-prioritized markdown backlog.

## 1. Auto-File Routing

**Output path:** `./docs/tracking/YYMMDD-[focus-area]-backlog.md`

Date format: `YYMMDD` (e.g., `260618` for June 18, 2026). Focus area: lowercased, hyphenated (e.g., `ui-ux`, `api-performance`, `security`).

**State check:** If the target file exists, read it silently. Never overwrite existing rows — only append new ones. Parse existing IDs to avoid duplicates.

## 2. Smart Audit Loop

Scan the codebase iteratively by domain. Focus primarily on the requested `[FOCUS AREA]`, but also log adjacent technical debt and proactive improvements connected to it.

**Scan order:**
1. Backend core services, data models, API routes
2. AI/Agent layer (Temporal workflows, agent state machines, model routers)
3. Frontend components, hooks, state management
4. Infrastructure (Docker, migrations, config)

**What to look for:**
- **Bugs:** Broken logic, missing error handling, race conditions, data leaks
- **Improvements:** Performance optimizations, better patterns, missing abstractions, code duplication to extract
- **Debt:** Inconsistent patterns, missing types, hardcoded values, missing validation

Always tie every finding to actual code or files that exist in the repo.

## 3. Triage & Sprint Matrix

For every new item, assess:

| Field | Values |
|-------|--------|
| **Complexity** | `Low` · `Medium` · `High` — How hard is it to fix? |
| **Impact** | `Low` · `Medium` · `High` — How much value does the fix add? |

**Assign sprint using this exact matrix:**

| Sprint | Name | Criteria |
|--------|------|----------|
| **Sprint 1** | Quick Wins & Criticals | Low Complexity + Any Impact, **OR** High Impact + Medium Complexity |
| **Sprint 2** | Core Value | Medium Complexity + Medium/Low Impact |
| **Sprint 3** | Heavy Lifting | High Complexity + High/Medium Impact |
| **Sprint 4** | Optional Polish | High Complexity + Low Impact |

## 4. Write Pointers (Anti-Deferral)

For each item, write actionable `Pointers to Solve`.

**For High Complexity items:** Break down into 2-3 specific technical sub-steps so the future coding agent knows exactly how to start. Do not write vague hints like "refactor this" — write concrete steps like "Extract X into a separate function, move Y to a shared utility, update Z callers".

## 5. Output Format

Generate or append to the target file using this Markdown table schema:

| Column | Format |
|--------|--------|
| **ID** | `AUD-NNN` — increment logically from the highest existing ID |
| **Sprint** | `Sprint 1` · `Sprint 2` · `Sprint 3` · `Sprint 4` |
| **Area** | `Frontend` · `Backend` · `Agent` · `DB` · `Infra` |
| **Description** | What is the issue or improvement, with exact file path(s) |
| **Complexity** | `Low` · `Medium` · `High` |
| **Impact** | `Low` · `Medium` · `High` |
| **Pointers to Solve** | Actionable technical hints (2-3 sub-steps for High Complexity) |
| **Status** | `Discovered` |

**Append-only rule:** Never break the markdown table formatting. Each row is a `|`-delimited line. If a file has 3 distinct issues, log them as 3 separate rows — no grouping.

**Staleness caveat:** When this backlog is later consumed by the `execute-backlog` skill (or any agent), every item must be verified against current code before fixing. Issues may have been resolved by prior work, and `Pointers to Solve` may reference old file paths or renamed functions. The executor should: (1) confirm the issue still exists, (2) if the issue is gone mark it `Not Valid Anymore`, (3) if pointers are stale discover the current fix from recent code.

## 6. Backlog Header

Include this header at the top of the file:

```markdown
# Code Audit Backlog — [FOCUS AREA]
_Generated: YYYY-MM-DD · Focus: [FOCUS AREA description]_
_Legend: **Impact** H/M/L · **Complexity** H/M/L_

---

## Items

| ID | Sprint | Area | Description | Complexity | Impact | Pointers to Solve | Status |
|----|--------|------|-------------|------------|--------|-------------------|--------|
```
