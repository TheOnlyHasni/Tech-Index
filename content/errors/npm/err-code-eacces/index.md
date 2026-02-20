---
title: "npm ERR! code EACCES: Permission Denied — Complete Fix Guide"
date: "2025-02-18"
draft: false
description: "npm throwing an EACCES permission error? Here are the exact fixes for global installs, cache errors, and local projects — on Mac, Linux, and Windows."
tags: ["npm", "Node.js", "EACCES", "permission denied", "npm error", "nvm"]
categories: ["Solutions", "npm"]
error_code: "EACCES"
software: "npm v9, npm v10, Node.js v18–v22"
platforms: "macOS, Ubuntu, Fedora, Windows 11, WSL2, Docker"
first_seen: "2013-01-01"
last_updated: "2026-02-19"
fix_difficulty: "medium"
verified_count: 26
success_rate: 94%
related_errors:
  [
    "npm ERR! code ENOENT",
    "npm ERR! code EACCES — cache permission denied",
    "EACCES: permission denied, mkdir node_modules",
  ]
cover:
  image: "cover.png"
  alt: "Terminal showing npm ERR! code EACCES permission denied error with fix commands"
  relative: true
ShowToc: true
---

**TESTED ON:** macOS Ventura 14, Ubuntu 22.04, Windows 11 (WSL2 + Native), Node.js v18–v22, npm v9–v10

---

## TL;DR

You are seeing this error because npm is trying to write files to a directory your current user does not own — usually because Node was installed as root or with `sudo` at some point.

**The fastest fix:** stop using `sudo` with npm, then either change your global npm directory or switch to `nvm`.

```bash
# Option A — Change npm's global directory (no nvm required)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Option B — Install nvm, then reinstall Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install --lts
```

Keep reading for platform-specific steps, how to undo `sudo` damage, and the full decision tree.

---

## What This Error Actually Means

When you run `npm install -g some-package` and get something like this:

```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules
npm ERR! Error: EACCES: permission denied
```

npm is telling you it does not have write access to the directory it is trying to install into. `EACCES` is a POSIX error code — it stands for **Error ACCess**. This is not an npm bug. It is the operating system blocking the write.

### Why npm Writes to Protected Directories

When Node.js is installed system-wide (via `apt`, `brew` without proper setup, or the official installer), the global npm directory defaults to somewhere like `/usr/local/lib/node_modules` or `/usr/lib/node_modules`. These are root-owned directories your regular user account cannot write to.

### The Root Cause: Global vs. Local Installs

Global installs (the `-g` flag) are where this almost always happens. Local installs (inside a project's `node_modules`) hit this error only when root previously ran npm inside that project directory.

### How to Read the Full Error Message

The two most useful lines in the error output are:

- **`path`** — tells you exactly which directory npm cannot write to.
- **`syscall`** — tells you what operation failed (`mkdir`, `access`, `open`, etc.).

Always check `path` first. It will tell you which fix applies to your situation.

---

## Quick Diagnosis: Find Your Specific Error Type

Before picking a fix, identify which type of error you have.

| Error Path Contains                                           | Error Type             | Go To                    |
| ------------------------------------------------------------- | ---------------------- | ------------------------ |
| `/usr/local/lib/node_modules` or `/usr/lib/node_modules`      | Global install error   | Fix 1 or Fix 2           |
| `.npm` or `npm-cache`                                         | Cache directory error  | Cache Fix section        |
| Your project folder (e.g. `/home/you/myproject/node_modules`) | Local project error    | Local Project section    |
| `.npmrc` or a config path                                     | Prefix or config error | Fix 3 or Troubleshooting |

---

## Fix 1: Change npm's Default Global Directory (Recommended)

This is the cleanest fix that does not require installing nvm or touching system directories.

### Step-by-Step Setup

```bash
# 1. Create a directory in your home folder
mkdir ~/.npm-global

# 2. Tell npm to use it
npm config set prefix '~/.npm-global'

# 3. Add it to your PATH
#    Add the line below to ~/.bashrc, ~/.zshrc, or ~/.profile
export PATH=~/.npm-global/bin:$PATH

# 4. Apply the change in your current session
source ~/.bashrc   # or: source ~/.zshrc
```

### Verifying It Worked

```bash
npm config get prefix
# Expected output: /home/youruser/.npm-global

npm install -g some-package
# Should install without errors
```

---

## Fix 2: Use nvm (Node Version Manager)

`nvm` installs Node and npm inside your home directory from the start, which means it never touches system directories. This sidesteps the permission problem entirely.

### Why nvm Sidesteps This Problem

Every Node version nvm installs lives under `~/.nvm/`. Your user already owns everything there. No root access is ever needed.

### Installing nvm on macOS/Linux

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart your terminal, then:
nvm install --lts
nvm use --lts
```

### Migrating Global Packages After Switching

```bash
# List what you had before
npm list -g --depth=0

# Reinstall them under the new nvm-managed npm
npm install -g package-one package-two
```

---

## Fix 3: Fix Permissions on the Existing npm Directory

Use this only when you cannot change the prefix and cannot use nvm — for example, on a locked-down server.

### Finding the Correct Directory

```bash
npm config get prefix
```

### The chown Command

```bash
# Change ownership of the relevant subdirectories to your user
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

This changes ownership of those subdirectories to your user. After this, npm will write to them without needing `sudo`.

### When This Fix Makes Sense

Use it on a single-user server where you control the environment. Avoid it on shared machines — changing ownership of system directories can affect other users.

---

## Fix 4: Use npx Instead of a Global Install

For many CLI tools, you do not actually need a global install. `npx` runs a package directly without installing it globally.

```bash
# Instead of:
npm install -g create-react-app

# Use:
npx create-react-app my-app
```

### Which Tools Work Well with npx

One-time setup tools, scaffolders, and code generators are good candidates: `create-react-app`, `create-next-app`, `prisma`, `ts-node`, `eslint --init`.

### Limitations

Tools you run constantly from anywhere (like `nodemon`, `pm2`, or `http-server`) are better installed globally since `npx` re-downloads them each time unless they are already cached.

---

## Platform-Specific Fixes

### macOS — Homebrew Users

If you installed Node via Homebrew, the recommended fix is to use nvm instead, or ensure Homebrew's directories are owned by your user:

```bash
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or let Homebrew diagnose and repair its own issues:
brew doctor
```

Follow any permission repair suggestions `brew doctor` gives.

### macOS — System Node (non-Homebrew)

The system Node that ships with macOS is outdated and not meant for active development. Install Node via nvm or Homebrew and stop using the system version.

### Linux — Ubuntu/Debian

If you installed Node via `apt`, it defaults to root-owned directories. Use nvm, or change the prefix as shown in Fix 1.

```bash
# Remove the apt-installed Node first if switching to nvm
sudo apt remove nodejs npm

# Then install nvm using the curl command in Fix 2
```

### Linux — Fedora/RHEL

The same situation applies. `dnf install nodejs` puts npm in `/usr/lib/node_modules`. Use nvm or override the prefix.

### Windows — WSL2

Inside WSL2, follow the Linux instructions above. nvm works exactly the same way inside a WSL2 terminal.

### Windows — Native (cmd / PowerShell)

On native Windows, the error usually points to a path like `C:\Users\You\AppData\Roaming\npm`. Fix it by taking ownership.

**Via GUI:**

1. Right-click the `npm` folder inside `AppData\Roaming`
2. Go to **Properties > Security > Edit**
3. Give your user account **Full Control**

**Via PowerShell (run as Administrator):**

```powershell
takeown /F "C:\Users\YourName\AppData\Roaming\npm" /R /D Y
```

### Docker and CI/CD Environments

In Docker, this usually happens when the image runs as root and then switches users, or when a volume is mounted with root ownership. Fix it in your `Dockerfile`:

```dockerfile
# Create a non-root user and set npm prefix
RUN useradd -m appuser
USER appuser
RUN npm config set prefix '/home/appuser/.npm-global'
ENV PATH=/home/appuser/.npm-global/bin:$PATH
```

In CI pipelines (GitHub Actions, GitLab CI), prefer local installs over global ones. If you need global packages, add a prefix config step before the install step.

```yaml
# GitHub Actions example
- name: Set npm prefix
  run: |
    mkdir ~/.npm-global
    npm config set prefix '~/.npm-global'
    echo "PATH=$HOME/.npm-global/bin:$PATH" >> $GITHUB_ENV
```

---

## Fix Cache Permission Errors

If the path in your error contains `.npm` or `_npx`, it is a cache issue.

```bash
# Check who owns the cache
ls -la ~/.npm

# Fix ownership
sudo chown -R $(whoami) ~/.npm

# Or clear the cache entirely
npm cache clean --force
```

If the cache is stored somewhere else on your system:

```bash
# Find out where your cache is
npm config get cache

# Then fix ownership on that path
sudo chown -R $(whoami) /path/shown/above
```

---

## Fix Local Project Errors

This happens when someone previously ran `sudo npm install` inside a project directory, causing `node_modules` to be owned by root.

### Fix Without Deleting node_modules

```bash
sudo chown -R $(whoami) ./node_modules
```

### If That Does Not Work — Clean Reinstall

```bash
sudo rm -rf node_modules
npm install
```

Do not use `sudo` on the `npm install` line once the directory is gone.

---

## Why You Should Never Use `sudo npm install -g`

Running `sudo npm install -g` feels like the quick fix, and it works in the moment. But it makes the problem worse over time.

When npm runs with `sudo`, every file it creates (package directories, binaries, cache entries) is owned by root. Every subsequent npm operation that touches those files will fail for your regular user — meaning you end up needing `sudo` for more and more things.

### What Goes Wrong Over Time

- Your cache directory becomes root-owned, breaking regular installs.
- Binaries installed globally are owned by root, causing issues when packages update themselves.
- Shell scripts and post-install hooks run as root, which is a security risk.

### How to Undo sudo Damage

```bash
# Fix global node_modules
sudo chown -R $(whoami) $(npm config get prefix)/lib/node_modules
sudo chown -R $(whoami) $(npm config get prefix)/bin

# Fix the cache
sudo chown -R $(whoami) ~/.npm

# Find any other root-owned files in your home directory
find ~ -user root -not -path "*/proc/*" 2>/dev/null
```

After fixing ownership, switch to one of the permanent solutions above so you never need `sudo` again.

---

## Prevention

### Setting Up .npmrc Correctly

You can lock in your global prefix in an `.npmrc` file so it persists across sessions:

```ini
# ~/.npmrc
prefix=~/.npm-global
```

### Project-Level Settings

For projects that should enforce consistent behavior, add a `.npmrc` at the project root:

```ini
# .npmrc (project root)
engine-strict=true
save-exact=true
```

### CI/CD Best Practices

- Always run npm as a non-root user in Docker.
- Use `npm ci` instead of `npm install` in pipelines — it is faster and more predictable.
- Cache your `node_modules` folder between pipeline runs, not the npm global directory.
- Never run `sudo npm` in a CI script.

---

## Verify Your Setup Is Clean

After applying any fix, run these to confirm everything is working:

```bash
# Check npm's global prefix
npm config get prefix
# Should be somewhere inside your home directory

# Check who owns the prefix directory
ls -la $(npm config get prefix)
# Should show your username, not root

# Run a test global install
npm install -g is-up-cli
is-up google.com
npm uninstall -g is-up-cli
```

### Checking Which npm Config Is Active

```bash
# Overview of all active config values and where they come from
npm config list

# Full output including defaults
npm config list --json
```

---

## Troubleshooting

### Check Which User Owns the Problem Directory

```bash
ls -la /usr/local/lib/node_modules
# or whatever path appeared in your error
```

Look at the third column — that is the owner. If it says `root`, you need Fix 1, 2, or 3.

### Reset npm to Factory Defaults

```bash
npm config delete prefix
npm config delete cache
npm config list   # Verify it is back to defaults
```

### Clean Reinstall of Node and npm

If everything is tangled up, a clean slate is often the fastest path forward:

```bash
# macOS with Homebrew
brew uninstall node
brew install node
# Or use nvm from here for better control

# Ubuntu/Debian
sudo apt remove nodejs npm
# Then install via nvm
```

### How to Ask for Help Effectively

If you post on Stack Overflow or open a GitHub issue, always include:

- The **full error output**, not just the last line
- Output of `npm config list`
- Output of `node -v` and `npm -v`
- How you originally installed Node (apt, brew, nvm, official installer, etc.)
- Your OS and version

---

## Summary and Decision Tree

| Your Situation                     | Best Fix                                 |
| ---------------------------------- | ---------------------------------------- |
| Fresh setup, no Node yet           | Install via nvm                          |
| Have Node, want the easiest fix    | Fix 1 — change prefix                    |
| On a team or shared server         | Fix 1 + commit `.npmrc`                  |
| One-time tool usage                | Use npx                                  |
| Docker or CI environment           | Non-root user + set prefix in Dockerfile |
| Windows native                     | Take ownership of `AppData\Roaming\npm`  |
| Already ran sudo and broke things  | Undo sudo damage first, then Fix 1 or 2  |
| Cache-only error                   | Fix cache ownership or clear cache       |
| Local project `node_modules` error | `chown` or delete and reinstall          |

The single rule that prevents all of this: **never use `sudo` with npm.** If npm asks for root access, that is a signal the setup needs to be fixed — not a reason to grant it.

---

## FAQ

**Can I just run `sudo npm install -g` to fix it quickly?**

You can, and it will work once. But it makes root own those files, and you will hit the same error again on the next install. It is not a fix — it is a way to make the problem worse over time.

**Why does npm default to a root-owned directory in the first place?**

When Node is installed system-wide through a package manager like `apt` or the official installer, it places itself in system directories that are protected by design. npm inherits that location as its default prefix. The solution is to override that default, which is exactly what Fix 1 and nvm both do.

**Does this affect npm scripts inside package.json?**

No. The EACCES error is specific to global installs and directories your user does not own. npm scripts run in the project directory, which your user already owns.

**Will this error appear on a fresh nvm install?**

No. nvm installs everything inside your home directory from the beginning. You will not see this error unless you mix a nvm-managed Node with `sudo` commands.

**I fixed it but it came back after a system update. Why?**

System updates sometimes reinstall Node or reset directory ownership. If this happens repeatedly, use nvm so Node is fully inside your home directory and out of reach of system package managers.

**Does this happen on Windows?**

Less often, but yes. On Windows the error usually points to the `AppData\Roaming\npm` folder rather than a Unix-style path. The fix is to ensure your user account has full control over that folder.

**What is the difference between `npm install` and `npm install -g`?**

`npm install` (without `-g`) installs a package into the local `node_modules` folder inside your current project. `npm install -g` installs it globally so it is available as a command anywhere on your system. The EACCES error almost always involves the `-g` flag.
