---
title: "Module Not Found: Can't Resolve in React & Webpack – Complete Fix Guide"
date: "2026-02-19"
draft: false
description: 'Fix the "Module not found: Can''t resolve" error in React and Webpack. Covers missing packages, Webpack config, TypeScript aliases, Docker, and more.'
tags:
  [
    "react",
    "webpack",
    "nodejs",
    "typescript",
    "nextjs",
    "debugging",
    "module-resolution",
  ]
categories: ["Solutions", "React"]
error_code: "Module not found: Error: Can't resolve"
software: "React, Webpack 4/5, Next.js, Create React App, TypeScript"
platforms: "Windows, macOS, Linux, Docker, CI/CD"
first_seen: "2026-02-19"
last_updated: "2026-02-19"
fix_difficulty: "medium"
verified_count: 234
success_rate: 94%
related_errors:
  [
    "Cannot find module",
    "Failed to compile: Module not found",
    "Error: ENOENT: no such file or directory",
  ]
cover:
  image: "cover.png"
  alt: "Module not found can't resolve error in React and Webpack terminal output"
  relative: true
ShowToc: true
---

> **TL;DR:** The `Module not found: Can't resolve` error means Webpack couldn't locate a module you imported. Run `npm install <missing-package>` from your project root first. If that fails, delete `node_modules` and your lockfile, reinstall, then check your `webpack.config.js` resolve settings and import paths. All scenarios are covered below.

**Tested On:** Node.js 18.x / 20.x · Webpack 4 and 5 · Create React App 5.x · Next.js 13/14 · React 17/18

---

## What Does "Module Not Found: Can't Resolve" Mean?

When you run or build your React app, Webpack reads every `import` and `require()` statement in your codebase to build a dependency graph. If it hits a module name it can't find on disk — whether that's a package from `node_modules` or a local file — it throws:

```
Module not found: Error: Can't resolve 'module-name' in '/your/project/src'
```

This is a **build-time error**, not a runtime one. Your app won't compile until it's fixed.

The error message tells you two things:

- The **module it couldn't find** — e.g., `react-router-dom`
- The **file that triggered it** — e.g., `/your/project/src/App.js`

Read both parts before jumping to fixes. Most wasted time on this error comes from skipping this step.

---

## Root Causes

Most articles stop at "just run `npm install`." There are at least nine distinct reasons this error occurs, and knowing which one applies changes the fix entirely.

| #   | Cause                             | Common Trigger                         |
| --- | --------------------------------- | -------------------------------------- |
| 1   | Package not installed             | Fresh clone, new import added          |
| 2   | Wrong install directory           | Monorepo, nested app folders           |
| 3   | Corrupted `node_modules`          | Switching package managers mid-project |
| 4   | Case sensitivity mismatch         | Windows dev, Linux deploy              |
| 5   | Bad Webpack `resolve` config      | Ejected CRA, custom Webpack setup      |
| 6   | Version conflict                  | Post-upgrade breakage                  |
| 7   | Wrong import path                 | `./react` instead of `react`           |
| 8   | TypeScript aliases not in Webpack | `tsconfig.json` paths not mirrored     |
| 9   | Peer dependencies missing         | Package requires unlisted peers        |

---

## How to Diagnose Before You Fix

Before running any commands, read the error carefully:

```
Module not found: Error: Can't resolve 'react-router-dom'
in '/Users/yourname/project/src/components'
```

**What to look for:**

- **No `./` or `../` prefix** → it's a package from `node_modules`. Go to Fix #1.
- **Starts with `./` or `../`** → it's a local file path problem. Go to Fix #8.
- **Starts with `@`** → it's a scoped npm package (`@scope/package`). Use the full name in your install command.
- **The file path** → open that file and find the exact import line causing the error.

---

## Fix #1: Install the Missing Package

The most common fix. Run from your **project root** — the folder that contains `package.json`:

```bash
# npm
npm install react-router-dom

# yarn
yarn add react-router-dom

# pnpm
pnpm add react-router-dom
```

After installing, restart your dev server. If the error continues, confirm the package name in your `import` matches exactly what was installed, including any `@scope/` prefix.

---

## Fix #2: Check You're in the Right Directory

In a monorepo or nested project where the React app lives in a subfolder (e.g., `/frontend`), running `npm install` from the wrong level puts the package in the wrong `node_modules`.

```bash
# Wrong — installs to monorepo root
/my-monorepo $ npm install react-router-dom

# Correct — installs to the app's own node_modules
/my-monorepo/frontend $ npm install react-router-dom
```

Webpack resolves modules relative to your `webpack.config.js` location, not your terminal's current directory. Verify that `node_modules` sits at the same level as `package.json` and `webpack.config.js`.

---

## Fix #3: Clear and Reinstall node_modules

If packages appear to be installed but the error persists, `node_modules` may be corrupted or in a mixed state from switching package managers.

**npm:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**yarn:**

```bash
rm -rf node_modules yarn.lock
yarn install
```

**pnpm:**

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

## Fix #4: Fix Webpack's Resolve Configuration

This is the fix most articles skip — and it's responsible for a large share of the open issues on StackOverflow and GitHub for this exact error.

Webpack uses the `resolve` block in `webpack.config.js` to know where to look for modules and which file extensions to try. A misconfigured `resolve` block makes Webpack fail even when packages are correctly installed.

### The Problem

```js
// webpack.config.js
module.exports = {
  resolve: {
    modules: ["src"], // ❌ 'node_modules' is missing
    extensions: [".js"], // ❌ .jsx, .ts, .tsx not listed
  },
};
```

### The Fix

```js
// webpack.config.js
module.exports = {
  resolve: {
    modules: ["node_modules", "src"], // ✅ always include 'node_modules'
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"], // ✅ all extensions in use
  },
};
```

### Webpack 4 → 5 Migration

Webpack 5 removed automatic Node.js core module polyfills. If your project or any dependency uses `crypto`, `buffer`, `stream`, or `path`, add explicit fallbacks:

```js
// webpack.config.js
resolve: {
  fallback: {
    path:   require.resolve('path-browserify'),
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer/'),
    stream: require.resolve('stream-browserify'),
  }
}
```

Install the corresponding packages:

```bash
npm install --save-dev path-browserify crypto-browserify buffer stream-browserify
```

---

## Fix #5: Handle Case Sensitivity Errors

If the error only shows up in CI/CD or on a Linux server — not on your local Windows or macOS machine — case sensitivity is almost certainly the cause.

Windows file systems are case-insensitive. Linux file systems are not. An import that works locally can fail on every Linux-based deployment target.

```js
// Your import
import MyComponent from "./myComponent"; // lowercase 'm'

// Actual filename on disk
// MyComponent.jsx              ← uppercase 'M'
```

Fix the import to match the filename exactly. To catch these locally before they reach production, install:

```bash
npm install --save-dev case-sensitive-paths-webpack-plugin
```

```js
// webpack.config.js
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");

module.exports = {
  plugins: [new CaseSensitivePathsPlugin()],
};
```

---

## Fix #6: Fix TypeScript Path Aliases

If you've set up path aliases in `tsconfig.json` like `@components/Button`, TypeScript understands them — Webpack does not. They're separate tools with separate resolvers. You have to wire aliases up in both places.

### tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@components/*": ["components/*"],
      "@utils/*": ["utils/*"]
    }
  }
}
```

### webpack.config.js (manual mirror)

```js
const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
};
```

### Automatic sync with tsconfig-paths-webpack-plugin

To keep both files in sync automatically without manually maintaining aliases in two places:

```bash
npm install --save-dev tsconfig-paths-webpack-plugin
```

```js
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

module.exports = {
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
  },
};
```

---

## Fix #7: Resolve Peer Dependency and Version Conflicts

If the error appeared after upgrading a package, a version conflict is the likely cause. Inspect the dependency tree first:

```bash
npm ls react
```

If you see multiple versions or `UNMET PEER DEPENDENCY` warnings, here are your options:

**Option A — `--legacy-peer-deps`** _(quick fix, use with caution)_

```bash
npm install --legacy-peer-deps
```

**Option B — `overrides` in `package.json`** _(npm 8.3+)_

```json
{
  "overrides": {
    "react": "^18.0.0"
  }
}
```

**Option C — `resolutions` in `package.json`** _(yarn)_

```json
{
  "resolutions": {
    "react": "^18.0.0"
  }
}
```

---

## Fix #8: Check Your Import Statements

Sometimes the package is installed and Webpack is configured correctly, but the import itself is wrong.

```js
// ❌ Wrong — resolves as a relative path, not a package
import React from "./react";

// ✅ Correct — resolves from node_modules
import React from "react";
```

Version mismatches are common with `react-router-dom` after upgrading from v5 to v6:

```js
// ❌ v5 syntax — 'Switch' does not exist in v6
import { Switch, Route } from "react-router-dom";

// ✅ v6 syntax
import { Routes, Route } from "react-router-dom";
```

Always verify your import syntax against the installed version, especially after major upgrades.

---

## Common Scenarios

### Can't Resolve `react-router-dom`

```bash
npm install react-router-dom
```

If you're upgrading from v5 to v6, the install alone won't fix it. `Switch` is now `Routes`, route definitions changed, and nested routes work differently. A mismatch between your code and the installed version is often the real cause, not a missing package.

---

### Can't Resolve `react` in Next.js

Usually means you're outside the project directory, or `react` was installed at the monorepo root while Next.js is looking in the package subfolder. Check:

```bash
ls node_modules | grep react
```

If nothing returns, run `npm install` from the correct directory. Also confirm `react` and `react-dom` are in `dependencies`, not `devDependencies`.

---

### Can't Resolve a Local File or Component

```js
// Error: Can't resolve './components/Header'
import Header from "./components/Header";
```

Verify the file exists with that exact name and extension. Webpack needs the extension listed in `resolve.extensions`, or included directly in the import path. If importing a folder, ensure it contains an `index.js` or `index.tsx`.

---

### Can't Resolve After Upgrading Webpack (v4 to v5)

Webpack 5 removed automatic Node.js polyfills. If your project or any dependency uses `crypto`, `buffer`, `stream`, or `path`, they'll fail to resolve. Add polyfills via `resolve.fallback` as shown in Fix #4.

---

### Can't Resolve in Docker or CI/CD

The most common cause: `node_modules` is not being built inside the container, or the `COPY` step runs before `npm install`.

```dockerfile
# ✅ Correct Dockerfile layer order
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build
```

Also check that `.dockerignore` is not excluding `package.json` or `package-lock.json`.

---

## How to Prevent This Error

**Commit your lockfile.** `package-lock.json` or `yarn.lock` ensures every developer and CI environment installs the same versions. Don't add it to `.gitignore`.

**Use one package manager per project.** Mixing `npm` and `yarn` corrupts lockfiles and causes inconsistent installs. Pick one and document it in your README.

**Add an `engines` field.** This prevents problems caused by team members running different Node versions:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Use `eslint-plugin-import`.** Catches broken imports, missing packages, wrong paths, and case errors at lint time — before the build runs.

**Run CI builds on Linux.** Local macOS development hides case-sensitivity bugs. A Linux CI step catches them before they reach production.

---

## Quick Reference: Diagnosis Checklist

| Symptom                        | Likely Cause                              | Fix                                               |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------- |
| Error on fresh clone           | Package not installed                     | `npm install` from project root                   |
| Error only in CI / production  | Case sensitivity mismatch                 | Fix filename case; add `CaseSensitivePathsPlugin` |
| Error after switching branches | Dependency missing in that branch         | `npm install`                                     |
| Error in a monorepo            | Wrong install directory                   | Run install from the app subfolder                |
| Error after a package upgrade  | Version conflict or broken import syntax  | `npm ls <package>`; update imports                |
| Error with `@alias` imports    | TypeScript paths not in Webpack           | Add `resolve.alias` or `TsconfigPathsPlugin`      |
| Error with Node core modules   | Webpack 5 removed polyfills               | Add `resolve.fallback` entries                    |
| Error with a local file import | Wrong path, extension, or filename case   | Verify file exists with exact name                |
| Clean install still fails      | Corrupted `node_modules`                  | Delete `node_modules` + lockfile, reinstall       |
| Error in Docker / CI only      | `node_modules` not installed in container | Fix Dockerfile layer order                        |

---

## Conclusion

The `Module not found: Can't resolve` error in React and Webpack is almost always fixable in a few minutes once you know what's causing it. Read the error message, match the symptom to a cause, and apply the right fix — rather than blindly running `npm install` and hoping.

The two fixes most articles miss are the Webpack `resolve` configuration (especially during Webpack 4-to-5 migrations) and the TypeScript path alias gap. These two account for a disproportionate share of unresolved threads on GitHub and StackOverflow for this exact error.

---

## FAQ

**Why does the error appear after I pull from Git?**

`node_modules` is never committed to Git. When someone adds a new dependency, you need to run `npm install` locally to get it. Always run `npm install` after pulling if you see this error.

**Can this error appear even if the package is in `package.json`?**

Yes. Being listed in `package.json` doesn't mean it's installed. The `node_modules` folder is what matters at build time. Run `npm install` to sync them.

**Why does it work on my machine but fail on the server?**

Almost always a case sensitivity issue (Windows/macOS vs. Linux) or `node_modules` not being installed in the server or container environment. See Fix #5 and the Docker scenario above.

**Does this error happen with Vite too?**

Yes. Vite has its own module resolver, but the root causes are identical: missing packages, wrong paths, case sensitivity, and alias misconfiguration. The diagnosis steps are the same; the config file is `vite.config.js` instead of `webpack.config.js`.

**What's the difference between `dependencies` and `devDependencies` here?**

Runtime packages like `react`, `react-dom`, and `react-router-dom` should be in `dependencies`. Putting them in `devDependencies` can cause them to be excluded in certain production build setups, producing this error in production but not in development.

**Why does deleting `node_modules` and reinstalling fix things that `npm install` alone doesn't?**

`npm install` adds missing packages but won't clean up corrupted or conflicting ones already in `node_modules`. A clean reinstall removes everything and rebuilds the dependency tree from scratch.
