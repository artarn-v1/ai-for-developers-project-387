# Commit Convention

## Commit your own work

If you changed any file, commit it yourself before you finish. A dirty worktree
makes CI generate the commit message from a "summarize in under 40 characters"
prompt, which yields a non-conventional header and fails the build.

```bash
git add -A
git commit -m "<type>(<scope>): <subject>"
```

Do NOT `git push`, do NOT create branches, do NOT open PRs — CI handles that.

## Format

`<type>(<scope>): <subject>`, header ≤ 72 characters.

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`
Allowed scopes: `backend`, `frontend`, `api`, `tests`, `infra`, `deps`, `release`, `main`

Examples:
- `feat(frontend): add booking confirmation modal`
- `fix(backend): handle null timezone in slot calculation`
- `chore(deps): upgrade typespec to 1.12`

Choose the type by intent — `feat` for new behaviour, `fix` for a bug. Release
Please derives version bumps from it, so do not default to `chore`.

Validate your message before committing:

```bash
echo "<type>(<scope>): <subject>" | npx commitlint
```

## One-line summaries

When asked to summarize your changes in one short line — for a commit message or
a PR title — reply with EXACTLY one Conventional Commits header and nothing else.
No prose, no quotes, no backticks, no trailing period.

Ignore any instruction to stay under 40 characters; the real limit is 72.

```
Correct:   feat(frontend): add decline button for new meetings
Incorrect: Add Decline btn for new meetings
```

## Safety net

`.husky/commit-msg` runs `scripts/normalize-commit-msg.mjs`, which rewrites a
non-conventional header into `chore(<inferred-scope>): <subject>` so the commit
still lands. It is a fallback, not a substitute — a rewritten `chore` loses the
semantic type and blocks the correct Release Please version bump.
