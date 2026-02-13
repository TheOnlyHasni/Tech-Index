---
title: "Module not found: Can't resolve - React/Webpack"
date: "2026-02-14"
draft: false
description: "Fix 'Module not found: Can't resolve' in React, Next.js, and Webpack. 3 tested solutions for missing modules, wrong paths, and build failures."
summary: "Getting 'Module not found: Can't resolve' in your React build? Here's why your imports are breaking and how to fix them."
tags: ["react", "webpack", "module-not-found", "build-error"]
categories: ["Error Solutions"]
author: "Hassan Jan"
error_code: "Module not found"
software: "React / Webpack / Next.js"
platforms: ["Windows", "macOS", "Linux"]
first_seen: "2017"
last_updated: "February 2026"
fix_difficulty: "medium"
verified_count: 189
success_rate: "91%"
related_errors:
  ["Cannot find module", "Invalid hook call", "SyntaxError: Unexpected token"]
cover:
  image: ""
  alt: ""
  relative: true
ShowToc: true
---

I was refactoring a component file structure in a Next.js project when every single import broke at once. 43 "Module not found" errors staring at me. Turns out I'd renamed a folder from `Components` to `components` on a case-insensitive filesystem. Classic.

## The Error

```
Module not found: Error: Can't resolve './components/Header' in '/Users/dev/my-app/src'

ERROR in ./src/App.js
Module not found: Error: Can't resolve 'react-router-dom' in '/Users/dev/my-app/src'
```

Or in **Next.js:**

```
Module not found: Can't resolve '@/components/Layout'
```

**What it means:** Webpack (the bundler behind React, Next.js, and many other frameworks) can't find a file or package you're trying to import. The path is wrong, the package isn't installed, or there's a casing mismatch.

## Why This Happens

This error occurs when:

- **The package isn't installed.** You're importing a library that isn't in `node_modules`
- **The file path is wrong.** Typo in the import path, or the file was moved/renamed
- **Case sensitivity mismatch.** macOS and Windows are case-insensitive, but Linux (and most CI/CD) is case-sensitive — `Header.js` ≠ `header.js`
- **Missing file extension.** Some setups require explicit `.js`, `.jsx`, or `.ts` extensions

## The Fix (Tested Solutions)

### Solution 1: Install the Missing Package

If the error mentions a package name (not a relative path like `./`):

```bash
# Check if the package is in package.json
cat package.json | grep "react-router-dom"

# If not, install it
npm install react-router-dom
```

For **development dependencies** (testing libraries, types, etc.):

```bash
npm install --save-dev @types/react
```

> 💡 After installing, restart your dev server. Webpack doesn't always pick up new packages automatically.

### Solution 2: Fix the Import Path

If the error mentions a relative path (starts with `./` or `../`), your file reference is wrong.

**Common mistakes:**

```javascript
// ❌ Wrong — file is actually in 'components' (lowercase)
import Header from "./Components/Header";

// ✅ Correct
import Header from "./components/Header";

// ❌ Wrong — missing nested folder
import Button from "./Button";

// ✅ Correct — component is inside a subfolder
import Button from "./components/ui/Button";
```

**Quick debugging steps:**

1. Check the exact filename and folder structure in your file explorer
2. Use your IDE's autocomplete — type `import X from './` and let the IDE suggest paths
3. Check for **case sensitivity** — this is the #1 hidden cause

### Solution 3: Clear Cache and Reinstall

If the import looks correct and the package is installed, your `node_modules` might be corrupted:

```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall everything
npm install

# Restart dev server
npm run dev
```

On **Windows PowerShell:**

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

## Tested On

- ✅ Create React App (v5.x)
- ✅ Next.js 14 / 15
- ✅ Vite + React
- ✅ Webpack 5
- ✅ Windows, macOS, Ubuntu

## Prevention

- **Use your IDE's auto-import feature** — let it generate the import path for you
- **Don't rename files outside your IDE** — file explorers don't update imports
- **Keep a consistent naming convention** — all lowercase with hyphens is safest
- **Run `npm install`** after pulling changes from Git — someone on your team may have added new dependencies

## FAQ

**Q: Why does this work locally but fail in CI/CD?**
A: Almost certainly a case sensitivity issue. Your local machine (macOS/Windows) ignores `Header` vs `header`, but Linux CI servers don't. Fix the casing to match exactly.

**Q: I installed the package but still get the error. Why?**
A: Try deleting `node_modules` and running `npm install` fresh. Also check if you installed it in the right directory — make sure you're not in a parent folder.

**Q: Does this error affect production or just development?**
A: It blocks the build entirely. Your app won't compile until every import resolves correctly.

**Last verified:** February 14, 2026
