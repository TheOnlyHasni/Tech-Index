---
title: 'How to Set Up SSH Keys for GitHub, GitLab, and Bitbucket'
date: '2026-03-03'
draft: false
description: 'Set up SSH keys for GitHub, GitLab, and Bitbucket in one guide. Covers key generation, agent setup, multi-account config, and troubleshooting.'
tags: ['ssh', 'git', 'github', 'gitlab', 'bitbucket', 'devtools']
categories: ['Developer Tools']
author: 'Hassan Jan'
cover:
    image: 'cover.png'
    alt: 'Terminal window showing SSH key generation and Git platform logos'
    relative: true
reviewed_by: ''
reviewer_link: ''
ShowToc: true
---

## TL;DR

| Step | Command / Action |
|------|-----------------|
| Check existing keys | `ls ~/.ssh/` |
| Generate new key | `ssh-keygen -t ed25519 -C "your@email.com"` |
| Start SSH agent | `eval "$(ssh-agent -s)"` |
| Add key to agent | `ssh-add ~/.ssh/id_ed25519` |
| Copy public key | `cat ~/.ssh/id_ed25519.pub` |
| Upload to platforms | GitHub → GitLab → Bitbucket settings |
| Test connections | `ssh -T git@github.com` |
| Multiple accounts | Create `~/.ssh/config` with host aliases |

---

> **Tested on:** Ubuntu 22.04, macOS Ventura, Windows 11 (Git Bash and WSL2)

---

## What Are SSH Keys and Why Use Them?

SSH keys are a pair of cryptographic files: a **private key** (stays on your machine) and a **public key** (uploaded to the platform). When you connect, the platform checks that your private key matches the public key on file — no password required.

Compared to HTTPS with a personal access token, SSH keys are:

- More secure — no token to leak or rotate manually
- More convenient — no re-entering credentials after setup
- Required by some team workflows for deploy keys and CI pipelines

### Ed25519 vs RSA

| | Ed25519 | RSA |
|---|---|---|
| Recommended | ✅ Yes | ⚠️ Legacy only |
| Key size | Short (68 chars) | Long (3000+ chars) |
| Speed | Faster | Slower |
| Compatibility | Modern systems | Older enterprise servers |

Use **Ed25519** unless you are connecting to a legacy system that does not support it.

---

## Step 1: Check for Existing SSH Keys

Before generating anything, check whether you already have a key pair:

```bash
ls ~/.ssh/
```

If you see any of the following, you already have keys:

- `id_ed25519` + `id_ed25519.pub`
- `id_rsa` + `id_rsa.pub`

You can reuse an existing key rather than generating a new one. If the `~/.ssh/` directory does not exist or is empty, move on to Step 2.

> **When to generate fresh:** If your existing key has no passphrase, or was created with RSA at under 4096 bits, generate a new Ed25519 key.

---

## Step 2: Generate a New SSH Key Pair

Run the following command, replacing the email with the one tied to your Git accounts:

```bash
ssh-keygen -t ed25519 -C "your@email.com"
```

You will be prompted twice:

**1. File location**
Press `Enter` to accept the default (`~/.ssh/id_ed25519`). If you need separate keys per account, give it a distinct name here instead:

```
~/.ssh/id_ed25519_github
```

**2. Passphrase**
Set one. A passphrase protects your private key so that even if someone gets the file, they cannot use it. The SSH agent (Step 3) means you only type it once per session.

After running the command, two files are created:

| File | Purpose |
|------|---------|
| `~/.ssh/id_ed25519` | Private key — **never share this** |
| `~/.ssh/id_ed25519.pub` | Public key — upload this to platforms |

---

## Step 3: Add Your Key to the SSH Agent

The SSH agent holds your decrypted private key in memory so you do not re-enter your passphrase on every Git operation.

### Start the agent

```bash
eval "$(ssh-agent -s)"
```

### Add your private key

```bash
ssh-add ~/.ssh/id_ed25519
```

You will be asked for your passphrase once. After that, the agent handles authentication silently.

### Make it persistent across sessions

**macOS** — add to `~/.zshrc` or `~/.bash_profile`:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

Then add to `~/.ssh/config`:

```
Host *
  AddKeysToAgent yes
  UseKeychain yes
```

**Linux** — add to `~/.bashrc`:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

**Windows (Git Bash or WSL2)** — add to `~/.bashrc`:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

---

## Step 4: Add Your Public Key to Each Platform

First, copy your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Select and copy the entire output. It starts with `ssh-ed25519` and ends with your email.

### GitHub

1. Go to **github.com → Settings → SSH and GPG keys**
2. Click **New SSH key**
3. Give it a recognizable title (e.g., `Work MacBook 2025`)
4. Paste your public key
5. Click **Add SSH key**

[PLACEHOLDER: Screenshot showing the GitHub SSH key settings page with the "New SSH key" button highlighted]

### GitLab

1. Go to **gitlab.com → User menu (top right) → Preferences → SSH Keys**
2. Paste your public key in the **Key** field
3. Add a title and optionally an expiration date
4. Click **Add key**

> GitLab lets you set an expiration date on keys, which is useful for security audits. GitHub does not have this option for personal SSH keys.

### Bitbucket

1. Go to **bitbucket.org → Personal settings → SSH keys**
2. Click **Add key**
3. Add a label and paste your public key
4. Click **Add key**

> Bitbucket also supports workspace-level SSH keys for CI/CD pipelines. The above covers your personal account only.

---

## Step 5: Test Your SSH Connection

Test each platform individually. You do not need to be inside a repository.

**GitHub:**

```bash
ssh -T git@github.com
```

Expected: `Hi username! You've successfully authenticated...`

**GitLab:**

```bash
ssh -T git@gitlab.com
```

Expected: `Welcome to GitLab, @username!`

**Bitbucket:**

```bash
ssh -T git@bitbucket.org
```

Expected: `logged in as username.`

If you see `Permission denied (publickey)`, jump to the [Troubleshooting](#troubleshooting) section below.

---

## Managing Multiple SSH Keys

This is where most guides stop — and where most people run into problems.

If you have two GitHub accounts (personal and work), or use all three platforms, you need to tell SSH which key to use for which host.

### Generate separate keys per account

```bash
ssh-keygen -t ed25519 -C "personal@email.com"
# Save as: ~/.ssh/id_ed25519_github_personal

ssh-keygen -t ed25519 -C "work@company.com"
# Save as: ~/.ssh/id_ed25519_github_work
```

Add all keys to the agent:

```bash
ssh-add ~/.ssh/id_ed25519_github_personal
ssh-add ~/.ssh/id_ed25519_github_work
```

### Create the SSH config file

Create or edit `~/.ssh/config`:

```
# Personal GitHub
Host github-personal
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github_personal

# Work GitHub
Host github-work
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github_work

# GitLab
Host gitlab.com
  HostName gitlab.com
  User git
  IdentityFile ~/.ssh/id_ed25519_gitlab

# Bitbucket
Host bitbucket.org
  HostName bitbucket.org
  User git
  IdentityFile ~/.ssh/id_ed25519_bitbucket
```

### Update your remote URLs

Use the host alias instead of `github.com` when setting or updating remotes:

```bash
# Instead of: git@github.com:username/repo.git
git remote set-url origin git@github-personal:username/repo.git
```

### Test the aliases

```bash
ssh -T git@github-personal
ssh -T git@github-work
```

[PLACEHOLDER: Diagram showing how the SSH config file maps host aliases to different keys and platforms]

---

## Troubleshooting

### Permission denied (publickey)

- Confirm the public key is correctly pasted on the platform — no trailing spaces or line breaks
- Run `ssh-add -l` to verify the agent has your key loaded
- Run `ssh -vT git@github.com` for verbose output showing exactly where authentication fails

### Agent not running

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

On Windows, make sure you are using Git Bash or WSL — not the standard Windows Command Prompt.

### Wrong key being used

Check your `~/.ssh/config` file. Use `ssh -vT git@github.com` and look for the `IdentityFile` line in the output to see which key is being attempted.

### Key not accepted after adding

It can take a few seconds for the platform to register a newly added key. Wait 30 seconds and try again. Also confirm you copied from the `.pub` file, not the private key.

### Bad file permissions

SSH is strict about file permissions. Fix them with:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

---

## Keeping Your Keys Secure

- Never commit your private key (`id_ed25519`, no `.pub`) to a repo, paste it in Slack, or store it in cloud sync
- Always use a passphrase when generating keys
- If a key is compromised, remove it from all platforms immediately and generate a new one
- Review your SSH keys on each platform once or twice a year and remove any you no longer use

---

## FAQ

**Can I use the same SSH key for GitHub, GitLab, and Bitbucket?**

Yes. One key pair works across all three. Upload the same `id_ed25519.pub` to each platform. Use separate keys only if you want to revoke access per platform without affecting others, or for security auditing purposes.

**Does my SSH key expire?**

On GitHub and Bitbucket, personal SSH keys do not expire by default. GitLab lets you set an optional expiration date. Leave the expiration field blank on GitLab and the key will not expire.

**What is the difference between Ed25519 and RSA?**

Ed25519 uses elliptic curve cryptography and produces smaller, faster keys. It offers stronger security than a 2048-bit RSA key. Use Ed25519 unless a system specifically requires RSA.

**I already have an RSA key. Do I need to switch?**

Not immediately. A 4096-bit RSA key is still acceptable. If yours is 2048 bits or smaller, generate a new Ed25519 key and replace it.

**What happens if I lose my private key?**

Generate a new key pair, upload the new public key to each platform, and remove the old one from your account settings. Your repositories are not affected since the key only controls authentication.

**Can SSH keys be used for GitHub Actions or Bitbucket Pipelines?**

Not in the same way. CI systems use deploy keys (repository-specific SSH keys) or access tokens, not your personal SSH key. Deploy keys are set up separately under repository settings.

**Do SSH keys work with Git on Windows without WSL?**

Yes, through Git Bash (included with Git for Windows). It ships with OpenSSH, and all commands in this guide work without modification. The `~` path maps to `C:\Users\yourname`.
