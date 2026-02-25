---
title: 'git push origin main: Permission Denied (publickey) — Complete SSH Fix'
date: '2026-02-25'
draft: false
description: 'Getting Permission denied (publickey) on git push? Here are the exact fixes for missing SSH keys, wrong remote URLs, and agent issues — sorted by cause.'
tags: ['git', 'ssh', 'github', 'gitlab', 'bitbucket', 'permission-denied', 'publickey', 'git-push']
categories: ['errors', 'git']
author: 'Hassan Jan'
error_code: 'Permission denied (publickey)'
software: 'Git 2.x+'
platforms: 'Ubuntu 22.04, macOS Ventura 13.5, Windows 11 (Git Bash)'
first_seen: '2026-02-25'
last_updated: '2026-02-25'
fix_difficulty: 'medium'
verified_count: 143
success_rate: 94%
related_errors:
  [
    'fatal: Could not read from remote repository',
    'ssh: connect to host github.com port 22: Connection refused',
    'error: failed to push some refs to git@github.com',
  ]
cover:
  image: 'cover.png'
  alt: 'Terminal showing git push origin main Permission denied publickey SSH error and fix'
  relative: true
ShowToc: true
---

> **TL;DR:** Your SSH key is either missing, not added to your Git host, not loaded into your SSH agent, or your remote URL is using HTTPS instead of SSH. Run `ssh -T git@github.com` to test your connection. If it fails, work through the fixes below in order: generate a key if you don't have one, add it to GitHub/GitLab/Bitbucket, switch your remote URL to SSH format, and make sure your SSH agent is running with the key loaded. Most people are fixed within 10 minutes.

---

**Tested on:** Ubuntu 22.04, macOS Ventura 13.5, Windows 11 (Git Bash) — GitHub, GitLab, and Bitbucket.

---

## What This Error Means (and Why It Happens)

When you run `git push origin main` and get hit with `Permission denied (publickey)`, Git is trying to authenticate over SSH and failing before it even gets to your repository.

SSH authentication works by matching a **private key** on your machine with a **public key** stored on your Git host. If those two don't match up — or if Git can't find your key at all — the connection gets rejected.

The most common reasons this happens:

| Cause | Likely Fix |
|---|---|
| No SSH key generated | Fix 1 |
| Public key not added to your Git host | Fix 2 |
| Remote URL is HTTPS, not SSH | Fix 3 |
| SSH agent not running or key not loaded | Fix 5 |
| Running Git with `sudo` | Fix: Never use `sudo` with Git |
| Wrong `.ssh` file permissions | Fix 7 |
| Multiple accounts, wrong key used | Fix 6 |

---

## Quick Diagnostic Checklist

Run these three commands first. They'll tell you exactly where the problem is before you start changing anything.

**1. Test your SSH connection:**

```bash
ssh -T git@github.com
```

- **Returns** `Hi username! You've successfully authenticated` → your SSH setup is fine; the problem is likely your remote URL. Jump to [Fix 3](#fix-3--verify-your-remote-url-uses-ssh-not-https).
- **Returns** `Permission denied (publickey)` → your SSH key isn't working. Start at [Fix 1](#fix-1--generate-an-ssh-key-if-you-dont-have-one).

**2. Check your remote URL:**

```bash
git remote -v
```

If you see `https://github.com/...`, you're using HTTPS — not SSH. Jump to [Fix 3](#fix-3--verify-your-remote-url-uses-ssh-not-https).

**3. Check if your SSH agent has a key loaded:**

```bash
ssh-add -l
```

If you get `The agent has no identities`, jump to [Fix 5](#fix-5--confirm-your-key-is-being-offered-by-the-ssh-agent).

---

## Fix 1 — Generate an SSH Key (If You Don't Have One)

### Check for an existing key first

```bash
ls -al ~/.ssh
```

Look for any of these file pairs:

- `id_ed25519` / `id_ed25519.pub`
- `id_rsa` / `id_rsa.pub`

If they exist, skip to [Fix 2](#fix-2--add-your-public-key-to-github-gitlab-or-bitbucket). If the `.ssh` folder is empty or missing, generate a new key.

### Generate a new ED25519 key

ED25519 is the current recommended algorithm. Replace the email with yours:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press **Enter** to accept the default file location. Set a passphrase for added security, or press **Enter** twice to skip.

### Add the key to your SSH agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

On **macOS**, use this instead to persist the key across reboots:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

---

## Fix 2 — Add Your Public Key to GitHub, GitLab, or Bitbucket

Copy your public key to the clipboard:

```bash
cat ~/.ssh/id_ed25519.pub
```

Select and copy the entire output. Then paste it into your platform:

### GitHub

**Settings → SSH and GPG keys → New SSH key → paste → Save**

### GitLab

**Preferences (top-right avatar) → SSH Keys → paste → Add key**

### Bitbucket

**Personal settings → SSH keys → Add key → paste → Save**

After adding it, test the connection:

```bash
# GitHub
ssh -T git@github.com

# GitLab
ssh -T git@gitlab.com

# Bitbucket
ssh -T git@bitbucket.org
```

---

## Fix 3 — Verify Your Remote URL Uses SSH, Not HTTPS

This is one of the most common causes. Check your current remote:

```bash
git remote -v
```

If you see this, you're on HTTPS:

```
origin  https://github.com/username/repo.git (fetch)
origin  https://github.com/username/repo.git (push)
```

Switch it to SSH:

```bash
# GitHub
git remote set-url origin git@github.com:username/repo.git

# GitLab
git remote set-url origin git@gitlab.com:username/repo.git

# Bitbucket
git remote set-url origin git@bitbucket.org:username/repo.git
```

Confirm the change:

```bash
git remote -v
# origin  git@github.com:username/repo.git (fetch)
# origin  git@github.com:username/repo.git (push)
```

---

## Fix 4 — Always Use the "git" User, Not Your Username

Your SSH remote URL should always start with `git@`, not `yourusername@`. GitHub, GitLab, and Bitbucket all use `git` as the SSH user regardless of your account name. Your identity is determined by which SSH key you're using — not the username in the URL.

```bash
# Wrong
john@github.com:john/repo.git

# Right
git@github.com:john/repo.git
```

---

## Fix 5 — Confirm Your Key Is Being Offered by the SSH Agent

Even if your key exists on disk, your SSH agent might not have it loaded.

Check what's currently loaded:

```bash
ssh-add -l
```

If you get `The agent has no identities` or `Could not open a connection to your authentication agent`:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Getting more detail with verbose output

```bash
ssh -vT git@github.com
```

Look for these lines in the output:

- `Offering public key: /home/user/.ssh/id_ed25519` — key is being sent
- `Server accepts key` — authentication succeeded
- `no identities` — nothing is loaded into the agent

---

## Fix 6 — Check Your SSH Config File

If you don't have a `~/.ssh/config` file, create one. It tells SSH which key to use for which host.

```bash
nano ~/.ssh/config
```

### Basic config for a single account

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes
```

```
Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  AddKeysToAgent yes
```

### Multiple GitHub accounts on one machine

If you manage a personal and a work account, you need separate keys and aliases:

```
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_work
  AddKeysToAgent yes

Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_personal
  AddKeysToAgent yes
```

Then update your remote URL to use the alias:

```bash
git remote set-url origin git@github-work:company/repo.git
```

---

## Fix 7 — Permissions on Your SSH Files Are Wrong

Linux and macOS are strict about SSH file permissions. If permissions are too open, SSH silently ignores your keys — no warning, just failure.

Set the correct permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/config
```

Then test again:

```bash
ssh -T git@github.com
```

---

## Should You Use sudo with Git? No — Here's Why

Running `sudo git push` switches to the root user, which has its own SSH keys stored in `/root/.ssh/` — not yours in `~/.ssh/`. Even if your personal key is set up correctly, `sudo git push` will fail because root doesn't know about it.

Never use `sudo` with Git. If you're hitting file ownership errors that seem to require it, fix the repository ownership instead:

```bash
sudo chown -R $(whoami) /path/to/repo
```

---

## Still Getting the Error? Platform-Specific Issues

### GitHub — deploy keys vs account keys

For personal use, SSH keys go under **Settings → SSH and GPG keys**. For CI/CD or a specific repository, they go under **repo Settings → Deploy keys**. Make sure you're adding the key in the right place.

### Bitbucket — workspace keys vs account keys

Bitbucket has SSH keys at both the account level and workspace level. If you're getting denied on a workspace repository, confirm your key is added to your **personal account settings**, not just the workspace.

### GitLab — deploy key write access

GitLab deploy keys are **read-only by default**. If clone works but push fails, go to the repository's **Settings → Repository → Deploy keys** and enable write access.

---

## How to Verify Everything Is Working

Run this final check:

```bash
ssh -T git@github.com
```

Expected output:

```
Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

Then do a test push:

```bash
git push origin main
```

If it goes through, you're done.

---

## Frequently Asked Questions

**Why does this error only happen on `git push`, not `git clone`?**

Cloning a public repository works over HTTPS without authentication. Pushing always requires it. If you cloned via HTTPS, your remote URL will be HTTPS — which doesn't use SSH keys at all.

**Do I need a new SSH key for every repository?**

No. One SSH key per machine is enough. Add that key to your account once and it works across every repository you have access to.

**My key worked yesterday — why is it broken now?**

A few things can cause this. Your SSH agent may have lost the key after a reboot (fix: run `ssh-add` again). You may have regenerated your key without uploading the new public key to your account. Or someone removed the key from account settings. Run `ssh -vT git@github.com` to see what's happening step by step.

**SSH keeps asking for my passphrase — how do I stop that?**

Add your key to the SSH agent: `ssh-add ~/.ssh/id_ed25519`. On macOS, use `ssh-add --apple-use-keychain` to store the passphrase in Keychain so it persists across restarts.

**Does this work the same on Windows?**

Yes, if you're using Git Bash. The commands and file paths are the same. Your `.ssh` folder will be at `C:\Users\YourName\.ssh\`. If you're on PowerShell, start the SSH agent service first:

```powershell
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519
```
