# Nuxt UI Dashboard Template

A reusable dashboard starter built with Nuxt and Nuxt UI. It includes common application-shell components, form examples, data tables, authentication scaffolding and server API examples.

The included pages and mock APIs are demonstrations only. They are not intended to prescribe a production domain model or backend contract.

![Dashboard screenshot](https://github.com/masyoudi/nuxt-ui-boilerplate/blob/master/screenshot.png?raw=true)

A Server-side rendering variant is available on the [`ssr` branch](https://github.com/masyoudi/nuxt-ui-boilerplate/tree/ssr).

## Features

- Nuxt application structure under `app/`.
- Nuxt UI components and centralized theme customization.
- Zod validation.

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
shared/          Runtime-neutral types and utilities
config/          Environment example and theme generation configuration
```
