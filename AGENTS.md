# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, etc.) working in this repo.

## Project

Nuxt v4 + Nuxt UI v4 dashboard boilerplate. SPA only (`ssr: false`). Source lives under
`app/` (Nuxt 4 `srcDir`), not the repo root.

## Setup & commands

- Package manager: **pnpm** only (`packageManager: pnpm@11.12.0`). Never use npm/yarn — don't touch `pnpm-lock.yaml` with another tool.
- Install: `pnpm install` (also runs `simple-git-hooks` + `nuxt prepare` via `postinstall`)
- Dev server: `pnpm dev` (reads env from `./config/.env` — copy `config/example.env` to `config/.env` first; the app will not start without it)
- Build: `pnpm build` / Preview: `pnpm preview` / Static: `pnpm generate`
- Lint: `pnpm lint` — **always run this before finishing a task**. Auto-fix: `pnpm lint:fix`

## Directory map (under `app/`)

```
app/
  components/              Global auto-imported components
  components/text-editor/  TipTap rich text editor + its extensions/actions
  composables/             useAuth() etc. — auto-imported, no manual import needed
  layouts/                 default.vue (app shell w/ sidebar), blank.vue (login page)
  middleware/              auth.ts (redirects to /login if not authed), unauth.ts (inverse)
  pages/                   File-based routing.
  theme/                   Nuxt UI component theme overrides (datepicker, modal, sidebar, multi-select)
  types/                   Shared TS types, app.d.ts is the global ambient types file
  utils/                   auth.ts (zod schemas), request.ts (useRequest/useRequestError), form.ts, helpers.ts — all auto-imported
  assets/css/              main.css, colors.css
  app.config.ts            Nuxt UI theme/appearance config (colors, per-component slot overrides)
shared/utils/              Utils shared between app/ and server/ (auto-imported everywhere)
server/                    Currently empty (.gitkeep only) — no API routes
config/                    colors.ts (theme color generation), .env (gitignored, required)
```

## Conventions this repo actually follows

- **Auto-imports everywhere.** Composables, utils, and components under `app/` are auto-imported by Nuxt.
  Don't write manual `import` statements for things in `composables/`, `utils/`, `shared/utils/`,
  or `components/` — check if it's already auto-importable before adding an import.
- **Zod for schemas.** Validation/data shapes (e.g. `authSchema` in `utils/auth.ts`) are defined with `zod` and
  typed via `z.output<typeof schema>`. Follow this pattern for new schemas rather than hand-written interfaces.
- **API calls** go through `useRequest()` / `useRequestError()` in `utils/request.ts`, not
  raw `$fetch` or `useFetch` — this keeps timeout/retry/error-toast behavior consistent.
- **Auth state** is managed via `useAuth()` (backed by `useStorage` from `@vueuse/core`,
  key `_auth`). Route protection is done via the `auth` / `unauth` middleware, not inline checks in pages.
- **Nuxt UI theming**: component-level visual overrides go in `app.config.ts` (slots/variants)
  or a dedicated file in `theme/` for larger overrides — not scattered `class` overrides in individual components.
- **ESLint via `@nuxt/eslint`**, config lives in `.nuxt/eslint.config.mjs` (generated) and is
  extended in `eslint.config.mjs`. Style rules enforced: single quotes, semicolons required,
  no trailing commas, arrow parens always. Don't fight these — run `pnpm lint:fix`.
- **Commits**: `commitlint.config.cjs` enforces Conventional Commits (`feat:`, `fix:`, `chore:`,
  etc.) via a git hook. Write commit messages accordingly or the commit will be rejected.
- **`server/` is currently empty.** If you add API routes, they go in `server/api/` following
  Nitro conventions — there's no existing pattern to match yet, so keep it idiomatic Nitro.

## Things not to do

- Don't add SSR-only patterns (`useAsyncData` for SEO, server middleware assuming SSR) — this app runs with `ssr: false`.
- Don't introduce a different HTTP client, state management library, or component library
  alongside Nuxt UI / VueUse without being asked — the stack is deliberately fixed.