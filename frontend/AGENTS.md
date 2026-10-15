# frontend/AGENTS.md

Shared rules (git workflow, commenting) are in the root [`AGENTS.md`](../AGENTS.md).

## Layout

Single SvelteKit app; all commands run from `frontend/`.

| Path | Role |
| --- | --- |
| `src/routes/` | Pages. `(entry)/` holds login and signup. `user/` holds the authenticated area: `projects`, `search-tags`, `logout`, and `[project_name]-[project_id=integer]/{todos,settings}`. Route-local components (`CreateProject.svelte`, `EditTag.svelte`, ...) and Zod schemas (`validator.ts`) sit next to the `+page` files. |
| `src/params/` | Route param matchers (`integer`, `name`). |
| `src/hooks.server.ts` | Reads cookies into `event.locals` (`sharedCookies`, `token`). Drops expired tokens. |
| `src/lib/generated-client/` | **Generated, gitignored.** `typescript-fetch` client (`apis`, `models`, `runtime`) plus `zod/schemas.ts`, produced from the backend's `openapi.json` by [`@fohoov/zod-openapi-client`](https://github.com/FoHoOV/zod-openapi-client). `zod/schemas.ts` exports Zod schemas only, no `z.infer` types: import TypeScript types from `$lib/generated-client/models`, or use `z.infer<typeof X>` / `z.input<typeof X>`. |
| `src/lib/client-wrapper/` | `clients.ts`: one factory per API (`ProjectClient({ token, fetchApi })`, ...), adding auth and timeout middleware. `wrapper.universal.ts`: `callService` maps every failure to a typed `ServiceError` (`ErrorType`). `wrapper.server.ts`: `callServiceInFormActions` for form actions. `wrapper.client.ts`: `callServiceInClient`. |
| `src/lib/actions/` | Svelte actions: `form` (enhanced submit + Zod validator, `superFail`, `namedActionResult`, `validateFormActionRequest`), `drag-and-drop`, `class-manipulator`. |
| `src/lib/stores/` | State as classes in `*.svelte.ts` files using runes, each with a `context.ts` (`getX`/`setX`). `context-manager/` adds a root context so stores can be set "to root". |
| `src/lib/components/` | Shared components, grouped by folder (`forms`, `popups`, `buttons`, `project`, `todos`, ...). |
| `src/lib/utils/`, `src/lib/animations/`, `src/lib/constants/` | Helpers (token, zod key extraction, storage types, type utilities), transitions, cookie keys. |
| `tests/` | Playwright E2E. `tests/routes/**` mirrors `src/routes/**`. `tests/fixtures/` holds page-object classes exposed as Playwright fixtures. `tests/common-locators/` holds shared locators. |
| `generate-client.js` | Loads `.env` (without overriding existing env vars) and runs `client-generator generate` against `$PUBLIC_API_URL/openapi.json`. It writes `openapitools.json` (gitignored). |

Data flow: page or component → `<form>` posts to a `+page.server.ts` named action → `validateFormActionRequest(request, schema)` → `callServiceInFormActions({ call: () => XClient({ token: locals.token, fetchApi: fetch }).method(...), errorSchema })` → `namedActionResult(result, 'name')` → `EnhancedForm` callbacks (`onSubmitSucceeded`) update the store.

## Tooling

From `package.json`, the configs, and `.github/workflows/test.yml`:

- Package manager: **pnpm 9** (`packageManager: pnpm@9.4.0`, `pnpm-lock.yaml`, CI, `.vscode/launch.json`). `.npmrc` has `engine-strict=true`. `README.md`, `run-windows.cmd` and Playwright's `webServer` command still use `npm` (`npm i --legacy-peer-deps`, `npm run build-integration && npm run preview`). Use pnpm.
- Node: CI uses 20. There is no `engines` field or `.nvmrc`.
- `.env` (from `.env.raw`): `PUBLIC_API_URL`, `PUBLIC_API_REQUEST_TIMEOUT_MS`, `PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS`. These are read via `$env/static/public`, so they must exist at build time.
- **Generate the API client first** (needs the backend running at `PUBLIC_API_URL`, and Java for openapi-generator 7.0.0):
  `pnpm run generate-client`. Re-run it after any backend schema or route change. Nothing type-checks until it exists.
  - The generator is pinned to zod 3 output; the app must stay on zod 3.
- Dev: `pnpm run dev`. Build: `pnpm run build`. Preview: `pnpm run preview` (port 5174).
- Typecheck: `pnpm run check` (`svelte-kit sync && svelte-check`).
- Lint: `pnpm run lint` (prettier check + eslint). Format: `pnpm run format`.
  - Both scripts pass `--plugin-search-dir`, which Prettier 3 removed. Plugins are declared in `.prettierrc`.
  - `eslint.config.js` ignores `generated-clients`, but the directory is `generated-client`.
- Unit tests: `pnpm run test:unit` (vitest, which runs in watch mode outside CI; use `pnpm exec vitest run` for a single run).
  - `vitest.config.ts` takes precedence over the `test` block in `vite.config.ts`. They disagree on `include`. The effective pattern is `src/**/*.(test).{js,ts}` with jsdom and `vitest-setup.ts`.
- E2E: `pnpm run test:integration` (Playwright; Chromium, Firefox and WebKit projects; CI runs Chromium only).
  - Its `webServer` builds with `--mode integration` (reads `.env.integration`) and previews on 5174.
  - It needs a running backend pointing at a throwaway DB. `README.md` says port 8090; CI uses 8080 via env vars.
  - `pnpm run test` runs integration and then unit.
- Deploy: Vercel via the deploy workflows. The build runs on Vercel with `installCommand` (`pnpm install --frozen-lockfile`) and `buildCommand` (`pnpm run generate-client && pnpm run build`) from `vercel.json`; the dashboard has no overrides. It needs the backend reachable at `PUBLIC_API_URL` at build time. `svelte.config.js` uses `adapter-auto`; `adapter-node` and `adapter-vercel` are installed but not referenced in config.

## Conventions observed in the code

- **Svelte 5 runes only**: `$props()`, `$state`, `$derived`, `$effect`, snippets and `{@render}`. No `export let`, `<slot>`, `createEventDispatcher`, or `svelte/store` usage remains. Component events are callback props (`onSubmitSucceeded`, ...). SvelteKit 2, Vite 5, TypeScript strict.
- Components use `<script lang="ts" module>` for imports and the exported `Props` type, then `<script lang="ts">` with `const { ... }: Props = $props();`.
- Stores: a class with private `$state` fields and a `value$` getter (e.g. `Projects` in `stores/projects/projects.svelte.ts`). Provided via `setProjects(new Projects(...))` and read via `getProjects()`, which may return `undefined`.
- Validation: per-route Zod schemas in `validator.ts`, type-checked against the generated models with `({}) as z.infer<typeof schema> satisfies ProjectCreate;`. Generated Zod schemas (`$lib/generated-client/zod/schemas`) are passed as `errorSchema` to map backend 422s onto form fields.
- Files: components are PascalCase `.svelte`. Everything else is kebab-case `.ts`. Each folder has an `index.ts` barrel. Rune-using modules are `*.svelte.ts`.
- Styling: Tailwind 3 + daisyUI 4 (`light`/`dark` themes, dark mode via `[data-theme="dark"]`) + `@tailwindcss/typography`. Classes are passed in as props such as `wrapperClasses` and `inputClasses`. Dynamically built class names must be added to `safelist` in `tailwind.config.js`. Icons come from Font Awesome via `svelte-fa`.
- Formatting (`.prettierrc`): tabs, single quotes, no trailing commas, width 100, `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`.
- Testing:
  - Unit tests are colocated as `Component.svelte.test.ts`, using `@testing-library/svelte/svelte5` and `@testing-library/jest-dom`, selecting by `data-testid`.
  - E2E tests are `*.spec.ts` under `tests/routes/`. They use fixture classes (`Auth`, project or todo helpers) that sign up a random user per test and select by `data-testid` (`PLAYWRIGHT_TEST_ID_ATTRIBUTE`) and roles.
- Inconsistencies (don't copy them):
  - Both `$components/...` and `$lib/components/...` imports are used for the same folder, sometimes in one file (`routes/+layout.svelte`).
  - Validator files are named `validators.ts` under `(entry)/` but `validator.ts` elsewhere.
  - `app.d.ts` references `SHARED_KEYS` without importing it.
