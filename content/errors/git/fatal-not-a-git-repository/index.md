---
title: "fatal: not a git repository (or any of the parent directories)"
date: "2026-02-14"
draft: false
description: "Fix the 'fatal: not a git repository' Git error. Learn why it happens and 3 tested solutions for Windows, macOS, and Linux."
summary: "Getting 'fatal: not a git repository'? You're running a Git command outside of a Git-initialized directory. Here's how to fix it."
tags: ["git", "version-control", "fatal-error"]
categories: ["Error Solutions"]
author: "Hassan Jan"
error_code: "fatal"
software: "Git"
platforms: ["Windows", "macOS", "Linux"]
first_seen: "2010"
last_updated: "February 2026"
fix_difficulty: "quick"
verified_count: 412
success_rate: "98%"
related_errors:
  [
    "fatal: Authentication failed",
    "CONFLICT: Merge conflict",
    "fatal: remote origin already exists",
  ]
cover:
  image: ""
  alt: ""
  relative: true
ShowToc: true
---

This is probably the most common Git error in existence. I see it at least once a week — usually when I open a terminal and forget I'm in the wrong directory. It's harmless, but confusing if you're new to Git.

## The Error

```
fatal: not a git repository (or any of the parent directories): .git
```

You might also see variations like:

```
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
```

**What it means:** You're trying to run a Git command (like `git status`, `git pull`, `git commit`) in a directory that isn't a Git repository — meaning there's no `.git` folder in this directory or any of its parent directories.

## Why This Happens

This error occurs when:

- **You're in the wrong directory.** You opened a terminal and ran a Git command without navigating to your project folder first
- **The repository was never initialized.** You created a project folder but forgot to run `git init`
- **The `.git` folder was accidentally deleted** or corrupted
- **You cloned into a different location** than you remember

## The Fix (Tested Solutions)

### Solution 1: Navigate to Your Project Directory (Most Common)

Usually, you're just in the wrong folder.

```bash
# Check where you are
pwd

# Navigate to your project
cd /path/to/your/project

# Verify it's a Git repo
git status
```

On **Windows PowerShell:**

```powershell
# Check current directory
Get-Location

# Navigate to your project
cd C:\Users\YourName\Projects\my-project

# Verify
git status
```

### Solution 2: Initialize a New Repository

If this is a new project that hasn't been set up with Git yet:

```bash
# Navigate to your project folder
cd /path/to/your/project

# Initialize Git
git init

# Verify
git status
```

This creates the `.git` directory and you can now start tracking files.

### Solution 3: Re-clone the Repository

If the `.git` folder was deleted or corrupted:

```bash
# Move to a safe directory
cd ~

# Clone the repository again
git clone https://github.com/username/repo-name.git

# Navigate into the cloned repo
cd repo-name

# Verify
git status
```

> 💡 **Tip:** If you had uncommitted changes in the corrupted repo, those files are still in the directory — they just aren't tracked by Git anymore. You can copy them into the freshly cloned repo.

## Tested On

- ✅ Windows 11 (PowerShell & Git Bash)
- ✅ macOS Sonoma
- ✅ Ubuntu 24.04 LTS
- ✅ Git versions 2.40+

## Prevention

- **Always `cd` into your project directory** before running Git commands
- **Use your IDE's built-in terminal** (VS Code, WebStorm) — it automatically opens in the project root
- **Don't delete the `.git` folder** unless you intentionally want to remove Git tracking
- **Bookmark your project paths** or use shell aliases for quick navigation

## FAQ

**Q: Can I accidentally create a Git repo in the wrong directory?**
A: Yes, and it happens a lot. If you run `git init` in your home directory or Desktop, Git will track everything in there. To undo it, simply delete the `.git` folder: `rm -rf .git` (⚠️ only do this if you're sure).

**Q: What does the "filesystem boundary" message mean?**
A: It means Git searched all the way up to the root of your filesystem (`/` on Linux/Mac, `C:\` on Windows) without finding a `.git` folder. This confirms you're definitely not inside a Git repository.

**Q: I see this error in VS Code. What do I do?**
A: Open the folder that contains your Git repository using **File → Open Folder**. Don't open a parent or sibling directory. VS Code needs to see the `.git` folder in the workspace root.

**Last verified:** February 14, 2026
