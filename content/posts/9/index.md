---
title: "How To Deploy Next.js With Environment Variables To Vercel"
date: "2026-02-15"
draft: false
description: "A comprehensive guide on managing local and production environment variables when deploying Next.js applications to Vercel."
summary: "Learn how to securely configure, manage, and deploy environment variables in Next.js using Vercel’s dashboard and CLI tools."
tags: ["Next.js", "Vercel", "Deployment", "DevOps"]
categories: ["Web Development"]
author: "Hassan Jan"
cover:
  image: "cover.png"
  alt: "Next.js and Vercel Deployment"
  relative: true
reviewed_by: ""
reviewer_link: ""
---

# How to Deploy Next.js with Environment Variables to Vercel

## TL;DR

Deploying Next.js to Vercel with environment variables is straightforward: create `.env.local` files for local development, prefix client-side variables with `NEXT_PUBLIC_`, then add your variables in Vercel's dashboard under **Project Settings → Environment Variables**. Vercel automatically loads these during deployment.

- **Environments**: Set different values for Production, Preview, and Development.
- **Security**: Never commit `.env.local` to Git.
- **Scope**: Use server-side variables (no prefix) for sensitive data like API keys.
- **System Vars**: Vercel provides built-ins like `VERCEL_ENV` automatically.

---

## What You'll Learn

This guide walks you through everything you need to deploy a Next.js application to Vercel with properly configured environment variables. You'll learn how to set up variables locally, configure them in Vercel, understand the differences between public and private variables, and follow best practices for secure, production-ready deployments.

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18 or later installed.
- **Next.js**: Basic familiarity with the framework.
- **Vercel Account**: A free or pro tier account.
- **Git**: A repository (GitHub, GitLab, or Bitbucket) with your project.

---

## Understanding Environment Variables in Next.js

### What Are Environment Variables?

Environment variables are key-value pairs that store configuration data outside your codebase. Instead of hardcoding an API key directly in your code like `const API_KEY = "abc123"`, you store it as an environment variable and reference it as `process.env.API_KEY`.

### Why Environment Variables Matter for Deployment

1.  **Security**: API keys and database credentials must never be committed to version control.
2.  **Flexibility**: Use different database connections or feature flags for development vs. production.
3.  **Team Collaboration**: Allows distinct local configurations without merge conflicts.

### Public vs. Private Environment Variables

Next.js handles environment variables in two distinct ways:

| Feature           | Private Variables               | Public Variables                         |
| :---------------- | :------------------------------ | :--------------------------------------- |
| **Prefix**        | None (e.g., `DB_PASS`)          | `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_API`) |
| **Accessibility** | Server-side only (API, SSR)     | Client & Server (Browser)                |
| **Security**      | High (Never exposed to browser) | Low (Injected into JS bundle)            |

> **Warning:** Never prefix sensitive data (like `STRIPE_SECRET_KEY`) with `NEXT_PUBLIC_`.

---

## Setting Up Environment Variables Locally

### Creating Your .env Files

Next.js supports multiple `.env` files with a specific loading priority:

- `.env.local`: Loaded in all environments, **ignored by Git**.
- `.env.development`: Loaded in development mode.
- `.env.production`: Loaded in production mode.
- `.env`: Base configuration loaded in all environments.

Create a `.env.local` file in your project root:

```bash
# .env.local
DATABASE_URL=postgresql://localhost:5432/mydb
API_SECRET_KEY=your-secret-key-here
NEXT_PUBLIC_API_URL=https://api.example.com
```

**Important**: Add `.env.local` to your `.gitignore` file immediately:

```text
# .gitignore
.env.local
.env*.local
```

### Loading Environment Variables in Next.js

Access variables in your code depending on the context:

```javascript
// Server-side (API route, server component)
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  // Use dbUrl safely - never exposed to client
}

// Client-side (browser code)
export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // This works in the browser because of the NEXT_PUBLIC_ prefix
  return <div>API is at: {apiUrl}</div>;
}
```

---

## Deploying Next.js to Vercel: Step-by-Step Guide

### Method 1: Deploy via Vercel Dashboard

1.  **Push Code**: Push your Next.js project to your Git provider.
2.  **Import Project**: In the [Vercel Dashboard](https://vercel.com), click **Add New → Project** and import your repo.
3.  **Configure Settings**: During or after import, navigate to **Settings → Environment Variables**.
4.  **Add Variables**: Enter the Key and Value.
5.  **Select Environment**: Choose Production, Preview, or Development.
6.  **Redeploy**: If you added variables after a build, go to **Deployments → Redeploy** to apply changes.

[PLACEHOLDER: Screenshot showing the Vercel settings menu for environment variables]

### Method 2: Deploy via Vercel CLI

For command-line workflows:

**1. Install & Link:**

```bash
npm i -g vercel
vercel login
vercel link
```

**2. Add Variables:**

```bash
# Add a production variable
vercel env add DATABASE_URL production

# Add a variable for multiple environments
vercel env add NEXT_PUBLIC_API_URL production preview development
```

**3. Pull for Local Use:**

```bash
vercel env pull .env.local
```

**4. Deploy:**

```bash
vercel --prod
```

---

## Vercel-Specific Environment Variables

### System Environment Variables

Vercel automatically exposes several system variables:

- `VERCEL_ENV`: The environment (`production`, `preview`, or `development`).
- `VERCEL_URL`: The deployment URL (e.g., `my-app-abc.vercel.app`).
- `VERCEL_GIT_COMMIT_SHA`: The Git commit hash.

### Practical Usage

```javascript
// lib/config.js
export const config = {
  baseUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000",
  isProd: process.env.VERCEL_ENV === "production",
};
```

---

## Advanced Configuration

### Build-time vs. Runtime

**Important limitation**: Next.js environment variables are embedded at **build time**. If you change a variable in the Vercel dashboard, you **must** trigger a new deployment (rebuild) for the changes to take effect.

[PLACEHOLDER: Diagram of the build-time injection workflow]

### Validation with Zod

To prevent your app from crashing in production due to missing keys, validate them at startup:

```javascript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(20),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

## Troubleshooting Common Issues

### Variables Not Loading

- **Redeploy**: Did you redeploy after adding the variable in the dashboard?
- **Prefix**: Does your client-side variable start with `NEXT_PUBLIC_`?
- **Typos**: Check for case sensitivity (e.g., `API_KEY` vs `api_key`).

### Security Exposure

If you accidentally committed a secret:

1.  **Rotate**: Change the API key/password immediately with the provider.
2.  **Update**: Update the value in Vercel.
3.  **Clean**: Use a tool like BFG Repo-Cleaner to remove it from Git history.

---

## Best Practices

- **`.env.example`**: Keep a template file in your repo with dummy values so teammates know what variables are required.
- **Naming**: Use `UPPER_SNAKE_CASE` (e.g., `STRIPE_WEBHOOK_SECRET`).
- **Edge Functions**: Ensure variables used in Middleware or Edge functions are compatible with the Edge runtime.

## Additional Resources

- [Next.js Official Documentation](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
- [T3 Env Library](https://env.t3.gg/)
