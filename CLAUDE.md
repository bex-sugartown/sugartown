# Sugartown — Claude Code Conventions

> These conventions apply to all sessions in this repo. They supplement MEMORY.md
> (auto-loaded) and docs/epic-template.md (used for epic authoring).

---

## Session Discipline

### Epic close-out sequence

When an epic is complete, run these steps in order before starting the next epic:

1. **Commit** all epic changes with a scoped message (`feat(...)`, `refactor(...)`, etc.)
2. **Mini-release** — run `/mini-release` to produce a patch version bump and CHANGELOG stub
3. **Clean tree** — confirm `git status` is clean before starting EPIC-N+1

Do not carry uncommitted changes across epic boundaries. If the working tree is dirty when a new epic begins, stop and commit or stash (`git stash push -m "WIP: EPIC-XXXX — <reason>"`) before proceeding.

A dirty tree at epic start is a process failure, not a starting condition.

### Studio schema changes get their own commit

Any change to `apps/studio/schemas/` that is **not** a direct consequence of a DS component API decision belongs in a separate commit scoped to a studio concern — it must **not** be bundled into a component, tooling, or web epic commit.

Commit prefix: `feat(studio):` or `fix(studio):`.

If a schema change is needed to unblock a component epic, commit the schema change first, then begin the component work in a subsequent commit.

---

## Pre-Commit Checklist for CSS Token Changes

Whenever `apps/web/src/design-system/styles/tokens.css` **or** `packages/design-system/src/styles/tokens.css` is edited:

1. Run `pnpm validate:tokens` from `apps/web/` and confirm **zero errors** before committing.
2. Update **both** token files in the same commit — they must stay in sync at all times.

This catches: duplicate definitions, renamed tokens with lingering references, and cross-file drift. See MEMORY.md §Token Drift Rules for background.
