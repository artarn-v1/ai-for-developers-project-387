# Commit Convention

All commit messages MUST follow Conventional Commits format: `<type>(<scope>): <subject>`

Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`
Allowed scopes: `backend`, `frontend`, `api`, `tests`, `infra`, `deps`, `release`, `main`

Examples:
- `feat(frontend): add booking confirmation modal`
- `fix(backend): handle null timezone in slot calculation`
- `chore(deps): upgrade typespec to 1.12`

Validate your message before committing:
```
echo "<type>(<scope>): <subject>" | npx commitlint
```

This is a HARD requirement — the repo enforces this via commitlint on PR merge.
