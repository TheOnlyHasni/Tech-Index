---
title: 'How to Deploy a Static Website to GitHub Pages for Free'
date: "2025-12-16"
lastmod: "2026-02-17"
draft: false
description: 'Deploy a static website to GitHub Pages for free in minutes. This step-by-step guide covers branch deployment, GitHub Actions, custom domains, and troubleshooting.'
tags: [github-pages, static-website, web-hosting, deployment, github-actions, jekyll, hugo]
categories: [Web Development, Hosting]
author: 'Hassan Jan'
cover:
    image: 'cover.png'
    alt: 'How to deploy a static website to GitHub Pages for free'
    relative: true
reviewed_by: "Tahseen - MERN Stack Dev"
reviewer_link: "https://www.facebook.com/profile.php?id=61583022910518"
ShowToc: true
---

## TL;DR
GitHub Pages lets you host a static website for free, directly from a GitHub repository. Push your files, enable Pages in your repo settings, and your site is live at `yourusername.github.io`. If your site has a build step (React, Hugo, Astro, etc.), a GitHub Actions workflow handles the build and deployment automatically. Custom domains and HTTPS are both supported at no extra cost.

---

## What Is GitHub Pages?

GitHub Pages is a static site hosting service built into GitHub. It reads files from a branch or a GitHub Actions workflow output and serves them at a public URL.

Every GitHub account gets one free user site at `yourusername.github.io`, plus unlimited project sites at `yourusername.github.io/repo-name`.

**What it supports:**

- Plain HTML, CSS, and JavaScript
- Jekyll (built natively, no workflow needed)
- Any framework that outputs static files via a build step

**What it does not support:**

- Server-side code (no PHP, Python, Node.js at runtime)
- Databases
- Dynamic rendering at request time

If your site is fully static, GitHub Pages covers everything you need.

---

## Tested On

| Tool | Version |
|---|---|
| Git | 2.43+ |
| Node.js (for JS frameworks) | 18, 20 |
| Hugo | 0.124+ |
| GitHub Actions runner | `ubuntu-latest` |

---

## Before You Start

Make sure you have:

- A free [GitHub account](https://github.com)
- [Git](https://git-scm.com/downloads) installed on your machine
- Your site files ready locally

If your project uses a framework, you should be able to run a build command locally (like `npm run build` or `hugo`) and get a folder of static output. That output folder is what gets deployed.

---

## Method 1: Deploy from a Branch (Plain HTML or Jekyll)

This is the fastest path. No build tools, no workflow files. You push your files and GitHub serves them directly.

### Step 1: Create a Repository

Go to [github.com/new](https://github.com/new).

- **User site:** Name the repo exactly `yourusername.github.io`. It will be served at the root URL.
- **Project site:** Use any name. It will be served at `yourusername.github.io/repo-name`.

Set visibility to **Public** on the free plan. Private repo Pages hosting requires a paid plan.

### Step 2: Push Your Files

Clone the repo and add your site:

```bash
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

Add an `index.html` at the root. Here is a minimal working example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Site</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello from GitHub Pages</h1>
</body>
</html>
```

Commit and push:

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** then **Pages** in the left sidebar
3. Under **Build and deployment**, select **Deploy from a branch**
4. Choose your branch (`main`) and folder (`/ (root)` or `/docs`)
5. Click **Save**

{{< img src="image1.png" alt="Screenshot of the GitHub Pages settings panel showing the branch and folder dropdowns" class="center-img-400">}}

Your site will be live within a minute or two at the URL shown at the top of the Pages settings panel.

---

## Method 2: Deploy with GitHub Actions (Frameworks with a Build Step)

If your site needs to be compiled before it can be served, branch deployment will not work on its own. You need a workflow that runs the build and hands the output to GitHub Pages.

This applies to Hugo, React, Vite, Astro, Next.js static export, and any other framework with an `npm run build` or equivalent command.

### Step 1: Set the Publishing Source to GitHub Actions

1. Go to **Settings** then **Pages**
2. Under **Build and deployment**, set the source to **GitHub Actions**

### Step 2: Add a Workflow File

Create the workflows directory:

```bash
mkdir -p .github/workflows
```

Then add a workflow file. Use the example below that matches your setup.

**Hugo:**

```yaml
# .github/workflows/deploy.yml
name: Deploy Hugo Site

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**React or Vite:**

```yaml
# .github/workflows/deploy.yml
name: Deploy React App

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **Vite note:** For project sites (not root user sites), add `base: '/your-repo-name/'` to `vite.config.js`. Without it, assets will 404.

```js
// vite.config.js
export default {
  base: '/your-repo-name/',
}
```

### Step 3: Push the Workflow and Watch It Run

```bash
git add .github/workflows/deploy.yml
git commit -m "Add Pages deployment workflow"
git push origin main
```

GitHub detects the file and triggers the workflow immediately. Open the **Actions** tab to watch it run in real time.

{{< img src="image2.png" alt="Screenshot of the GitHub Actions tab showing a successful workflow run with green checkmarks" class="center-img-400">}}
---

## Which Method Should You Use?

| Site type | Method |
|---|---|
| Plain HTML / CSS / JS | Method 1 |
| Jekyll | Method 1 (GitHub builds it natively) |
| Hugo | Method 2 |
| React / Vite | Method 2 |
| Astro | Method 2 |
| Next.js (static export) | Method 2 |
| Anything with `npm run build` | Method 2 |

Short version: if you run a build command before opening the site in a browser, use Method 2.

---

## Setting Up a Custom Domain

GitHub Pages supports custom domains for free. You need to own the domain and have access to its DNS settings.

### Add the Domain in GitHub

1. Go to **Settings** then **Pages**
2. Under **Custom domain**, enter your domain (e.g., `www.yourdomain.com`) and click **Save**

This creates a `CNAME` file at the root of your repo. If it does not appear automatically, create it manually with no file extension:

```
www.yourdomain.com
```

### Configure DNS

**For a `www` subdomain**, add a CNAME record at your registrar:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `www` | `yourusername.github.io` |

**For an apex domain** (no `www`), add four A records:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |

DNS changes usually propagate within an hour. Once they do, return to **Settings** then **Pages** and check **Enforce HTTPS** to activate your free SSL certificate via Let's Encrypt.

---

## Troubleshooting

### Site Not Showing Up

- Wait up to 10 minutes. First deploys are occasionally slow.
- Make sure there is an `index.html` or `index.md` at the root of your publishing source. A repo with only a `README.md` will not render a site.
- Confirm Pages is enabled in **Settings** then **Pages** and the correct branch or source is selected.

### 404 on Assets (CSS, JS, Images Not Loading)

This almost always comes down to base paths on project sites. Your site lives at `/repo-name/`, not `/`, so root-relative paths like `/style.css` will break.

Fix for Vite and React:

```js
// vite.config.js
export default {
  base: '/your-repo-name/',
}
```

Fix for Hugo:

```toml
# config.toml or hugo.toml
baseURL = "https://yourusername.github.io/your-repo-name/"
```

For plain HTML, use relative paths (`./style.css`, `./images/photo.jpg`) instead of root-relative ones (`/style.css`).

### GitHub Actions Workflow Failing

Open the **Actions** tab and click the failed run to see the full log. Common causes:

- **Wrong output folder** in `upload-pages-artifact`. Check it matches your actual build output (`dist`, `public`, `out`, `_site`, etc.)
- **Missing permissions block** in the workflow YAML. The `pages: write` and `id-token: write` permissions are required.
- **Submodules not fetched** for Hugo themes. Add `submodules: recursive` to the checkout step.
- **Node version mismatch.** Pin the version explicitly: `node-version: '18'` rather than relying on a default.

### Pushed Changes Not Appearing

- Check that you pushed to the branch configured in Pages settings.
- For Actions workflows, check the Actions tab to confirm the workflow ran after your push.
- Hard refresh your browser: `Ctrl+Shift+R` on Windows and Linux, `Cmd+Shift+R` on macOS.

---

## Updating Your Site After the Initial Deploy

After setup, updating is just a normal Git push:

```bash
git add .
git commit -m "Update content"
git push origin main
```

Branch deployments are usually live within one to two minutes. Actions workflows vary with build time but finish within two to five minutes for most sites. Every deploy is logged in the **Actions** tab, so you can inspect any run or roll back if something breaks.

If you work with a team, a common pattern is to keep a `staging` or `develop` branch for work in progress and only merge to `main` when the content is ready to publish. Your Pages workflow only triggers on the branch you configured.

---

## Limits and When to Look Elsewhere

| Limit | Value |
|---|---|
| Storage per repo | 1 GB |
| Monthly bandwidth | 100 GB soft limit |
| Build time per deploy | 10 minutes max |
| User or org sites per account | 1 (unlimited project sites) |
| Server-side code | Not supported |
| Private repo Pages | Requires paid GitHub plan |

For most personal projects, portfolios, and documentation sites these limits are never an issue. If they are, here are the most common alternatives:

- **Cloudflare Pages** for high-traffic sites with generous bandwidth and build limits
- **Netlify** for teams that want forms, edge functions, and split testing built in
- **Vercel** for Next.js and React projects that need a tighter, framework-native deployment pipeline

---

## Frequently Asked Questions

**Is GitHub Pages actually free?**
Yes, for public repositories on any GitHub plan including the free tier. Private repositories with Pages enabled require a paid plan (Pro, Team, or Enterprise).

**Can I host more than one site?**
You get one user or organization site at `username.github.io`. You can host as many project sites as you have repositories, each at `username.github.io/repo-name`.

**Does GitHub Pages work with private repositories?**
Yes, but only on paid GitHub plans. On the free plan, your repository must be public.

**Can I run PHP, Python, or connect to a database?**
No. GitHub Pages is a static host only. Everything must be pre-built into static files before deployment. For anything dynamic, you need a different hosting solution.

**How long does deployment take?**
Branch deployments go live in one to two minutes. Actions workflows typically finish within two to five minutes for average-sized sites.

**What happens if I go over the bandwidth limit?**
The 100 GB/month figure is a soft limit, not a hard cutoff. GitHub may throttle traffic if a site consistently exceeds it. For high-traffic sites, Cloudflare Pages is a better fit.

**Do I need to use Jekyll?**
No. Jekyll support is built in and optional. You can deploy a plain HTML site and never use Jekyll at all.
