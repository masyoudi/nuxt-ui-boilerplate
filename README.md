# Nuxt UI Dashboard Template

A reusable dashboard starter built with Nuxt and Nuxt UI. It includes common application-shell components, form examples, data tables, authentication scaffolding, server API examples, and a modular server structure that can be adapted to different business domains.

The included pages and mock APIs are demonstrations only. They are not intended to prescribe a production domain model or backend contract.

![Dashboard screenshot](https://github.com/masyoudi/nuxt-ui-boilerplate/blob/master/screenshot.png?raw=true)

A client-side rendering variant is available on the [`master` branch](https://github.com/masyoudi/nuxt-ui-boilerplate/tree/master).

## Features

- Nuxt application structure under `app/`.
- Nuxt UI components and centralized theme customization.
- Typed internal API requests through generated Nitro route types.
- Session-based authentication scaffolding.
- Zod validation shared between browser and server runtimes.
- Feature-first modular server examples under `server/domains/`.
- Request validation, pagination, multipart parsing, and WAF utilities.

## Requirements

- Node.js supported by the Nuxt version declared in `package.json`.
- pnpm using the version declared in the `packageManager` field.

## Setup

Install dependencies:

```bash
pnpm install
```

Create the local environment file:

```bash
cp config/example.env config/.env
```

Start the development server:

```bash
pnpm dev
```

The host and port are read from `config/.env`.

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
pnpm generate
pnpm lint
pnpm lint:fix
pnpm exec vue-tsc --noEmit --pretty false
```

## Project structure

```text
app/             Vue pages, layouts, components, composables, themes, and client utilities
server/api/      Nitro HTTP handlers
server/domains/  Feature-first business modules
server/utils/    HTTP and server infrastructure utilities
server/waf/      Request inspection and WAF implementation
shared/          Runtime-neutral schemas, types, and utilities
config/          Environment example and theme generation configuration
docs/            Architecture and extension guides
```
