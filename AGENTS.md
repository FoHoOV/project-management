# AGENTS.md

Project management app (projects, todo categories, todo items, tags, comments, dependencies, per-user permissions). Two independent apps in one repository, with no shared workspace tooling:

| Path | What it is | Details |
| --- | --- | --- |
| `backend/` | FastAPI + SQLAlchemy REST API (Python 3.14, uv) | [`backend/AGENTS.md`](backend/AGENTS.md) |
| `frontend/` | SvelteKit 3 + Svelte 5 app (pnpm) | [`frontend/AGENTS.md`](frontend/AGENTS.md) |

The only link between them is the HTTP API. The frontend's TypeScript client and Zod schemas are generated from the backend's `/openapi.json` and committed in `frontend/src/lib/generated-client/` (see `frontend/AGENTS.md`). **Any backend change to routes or schemas must include the regenerated client in the same PR**; CI fails when the committed client doesn't match the backend.

Other root files:
- `.github/workflows/test.yml`: backend pytest and frontend unit + Playwright (Chromium only). It runs only on PRs targeting `master`.
- `.github/workflows/deploy-preview.yml`, `deploy-production.yml`: Vercel deploys of both apps.
- `run-windows.cmd`: Windows one-shot setup and run script. It uses `npm`, not `pnpm`, and writes a hard-coded `SECRET_KEY` into `backend/.env`.
- `todos.code-workspace`: VS Code multi-root workspace (`frontend`, `backend`).

## Git workflow

- The base branch for agent work is **`claude-base`**, created from `master`. (It is not named `claude` because git can't hold a `claude` branch next to existing `claude/*` branches.)
- Never commit to, push to, merge into, rebase, or reset `master`. Never change repository settings, branch protection, or remotes.
- Don't change CI config (`.github/workflows/*`), with two exceptions the owner approved: adding lint/format/typecheck steps to `test.yml`, and updating runtime or package-manager steps in `test.yml`/`deploy-*.yml` so CI and deploys keep working after a tooling upgrade.
- Never commit directly to `claude-base`. Every change goes on its own branch named `claude-<short-kebab-name>`, created from the latest `claude-base`.
- Commit and push to the `claude-<name>` branch as you work.
- Don't open a PR until the user explicitly says the change is done. Then open one PR from `claude-<name>` into `claude-base` (never `master`).
- One logical change per branch. If a change depends on another unmerged branch, branch from that branch and state the dependency in the PR description.
- Commit messages use semantic prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`. Existing history also uses scopes, e.g. `fix(frontend): ...`, `refactor(backend): ...`.
- PR description: what changed, why, and anything the reviewer should check.
- CI (`test.yml`) only triggers on PRs into `master`, so PRs into `claude-base` get **no CI**. Run the checks listed in the sub-files locally before pushing.

## Comments

Code must be self-explanatory. Do not add comments that restate what the code does. Comment only when the code cannot convey the reason on its own: non-obvious business rules, workarounds for external bugs (link the issue), or complex logic like regex. Prefer better names and smaller functions over comments.
