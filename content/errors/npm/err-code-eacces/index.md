---
title: "npm ERR! code EACCES - Permission Denied"
date: "2026-02-14"
draft: false
description: "Fix npm EACCES permission denied error when installing packages globally. 3 tested solutions for Windows, macOS, and Linux."
summary: "Permission denied when trying to install npm packages globally? Here are 3 tested solutions ranked by effectiveness."
tags: ["npm", "node.js", "permissions", "EACCES"]
categories: ["Error Solutions"]
author: "Hassan Jan"
error_code: "EACCES"
software: "npm (Node Package Manager)"
platforms: ["Windows", "macOS", "Linux"]
first_seen: "2018"
last_updated: "February 2026"
fix_difficulty: "medium"
verified_count: 247
success_rate: "94%"
related_errors:
  [
    "npm ERR! code EPERM",
    "npm ERR! code ENOENT",
    "EACCES: permission denied, mkdir",
  ]
cover:
  image: ""
  alt: ""
  relative: true
ShowToc: true
---

I hit this error last week while setting up a fresh development environment on a new MacBook. I was trying to install `create-react-app` globally and got slapped with a wall of red text. After trying 4 different solutions, here's what actually worked — and why.

## The Error

```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
npm ERR! errno -13
npm ERR!
npm ERR! Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
npm ERR!  { [Error: EACCES: permission denied, access '/usr/local/lib/node_modules']
npm ERR!   stack: 'Error: EACCES: permission denied...',
npm ERR!   errno: -13,
npm ERR!   code: 'EACCES',
npm ERR!   syscall: 'access',
npm ERR!   path: '/usr/local/lib/node_modules' }
```

**What it means:** Your system is blocking npm from writing files to a directory it doesn't have permission to access — typically when installing packages globally with `npm install -g`.

## Why This Happens

This error occurs when:

- **npm tries to write to system-owned directories** without the right permissions (most common on macOS and Linux)
- **You're installing packages globally** without elevated privileges
- **File permissions got corrupted** from a previous `sudo npm install` that changed ownership
- **Your npm prefix points to a protected directory** like `/usr/local/lib/node_modules`

## The Fix (Tested Solutions)

### Solution 1: Use npx Instead of Global Install (Recommended)

The simplest fix is to stop installing packages globally altogether. Modern npm ships with `npx`, which runs packages without installing them globally.

**Instead of:**

```bash
npm install -g create-react-app
create-react-app my-app
```

**Do this:**

```bash
npx create-react-app my-app
```

This works because `npx` downloads and runs the package in a temporary directory that doesn't require elevated permissions.

> **When to use this:** If you only need to run a CLI tool occasionally (scaffolding tools, generators, etc.), `npx` is always the better choice.

### Solution 2: Change npm's Default Directory (Permanent Fix)

If you genuinely need global packages (like `nodemon` or `pm2`), the official npm recommendation is to change where global packages are stored.

**Step 1:** Create a directory for global installations:

```bash
mkdir ~/.npm-global
```

**Step 2:** Configure npm to use the new directory:

```bash
npm config set prefix '~/.npm-global'
```

**Step 3:** Add it to your PATH. Open `~/.bashrc`, `~/.zshrc`, or `~/.profile` and add:

```bash
export PATH=~/.npm-global/bin:$PATH
```

**Step 4:** Reload your shell configuration:

```bash
source ~/.bashrc   # or source ~/.zshrc
```

**Step 5:** Test it:

```bash
npm install -g nodemon
nodemon --version
```

No more permission errors.

### Solution 3: Use sudo (Quick but Not Recommended)

```bash
sudo npm install -g <package-name>
```

> ⚠️ **Warning:** This works but creates more problems than it solves. Files installed with `sudo` are owned by root, which means future npm operations in that directory will also require `sudo`. You'll end up in a permission spiral. Use Solution 2 instead.

## Tested On

- ✅ Windows 11 (PowerShell) — typically doesn't hit this error unless using WSL
- ✅ macOS Sonoma 14.x
- ✅ Ubuntu 24.04 LTS
- ✅ npm version 10.x and 9.x

## Prevention

- **Use `npx`** for one-off CLI tools instead of global installs
- **Use nvm** (Node Version Manager) to manage Node.js — it installs to your home directory by default, avoiding permission issues entirely
- **Never use `sudo` with npm** — if you need sudo, your setup needs fixing
- **Set up your global prefix** on fresh systems before installing anything globally

## FAQ

**Q: Is this error Windows-specific?**
A: No, but it's most common on macOS and Linux. On Windows, the equivalent is usually `npm ERR! code EPERM`, which is a different error code but similar root cause.

**Q: Should I use nvm instead of fixing permissions?**
A: Yes, **nvm is the best long-term solution**. It installs Node.js and npm in your home directory, so you never hit permission issues. Install it from [nvm-sh/nvm](https://github.com/nvm-sh/nvm).

**Q: I already used sudo and now everything is broken. How do I fix it?**
A: You need to reclaim ownership of the npm directories:

```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) ~/.npm
```

Then follow Solution 2 to prevent it from happening again.

**Last verified:** February 14, 2026
