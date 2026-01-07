---
title: "The Vibe Coding Workflow: How I Used a Localized LLM To Build A Custom Hugo Shortcode Without Writing A Single Line Of Manual CSS"
date: "2026-01-07"
draft: false
description: "Discover how vibe coding with a local LLM like Ollama lets you create custom Hugo shortcodes effortlessly, skipping manual CSS tweaks for faster, privacy-focused web development."
summary: "I walked through building a fancy callout box shortcode in Hugo using nothing but natural language prompts to a local AI model. No hand-written CSS involved."
tags: ["hugo", "llm", "vibe-coding", "ollama", "static-sites", "ai-development"]
categories: ["Tutorials", "AI & Productivity Tools"]
author: "Hassan Jan"
cover:
  image: "cover.png"
  alt: "Screenshot of a custom Hugo shortcode in action on a blog post"
  relative: true
reviewed_by: "Tahseen - MERN Stack Dev"
reviewer_link: "https://www.facebook.com/profile.php?id=61583022910518"
---

Static site generators like Hugo give you speed and control, but customizing them often means diving into HTML templates and then wrestling with CSS to make things look right. That loop of tweaking styles, refreshing the browser, and fixing overflows eats hours. Lately though, with local large language models running on your own machine, you can shift the whole process. You describe what you want in plain words, the AI spits out code, and you iterate until it fits. No cloud dependencies, no token costs piling up, and your prompts stay private.

I got hooked on this approach last month when I needed a custom shortcode for styled callout boxes on my site. Those highlighted sections for tips or warnings. Normally I'd code the HTML, then add inline styles or a class, and mess with CSS files until the padding and borders behaved. This time I fired up a local LLM and just talked it through. The result worked on the first solid iteration, and I never touched a stylesheet manually. In a world where AI coding tools dominate headlines in 2026, running everything locally keeps things snappy and secure. That's why this workflow matters now.

## What Vibe Coding Really Means in Practice

People throw around "vibe coding" a lot these days. Andrej Karpathy kicked off the term back in late 2025, describing it as letting go and trusting the AI to handle details while you guide with high-level ideas. You chat naturally, refine prompts, and watch code appear. But it shines brightest with local models because latency drops to nothing. No waiting for server responses.

I run Ollama on my laptop. It pulls open-source models like Llama 3.1 or whatever the latest Mistral variant is. Setup takes minutes: install Ollama, then pull a model with a single command. From there you interact via terminal or a simple web UI like Open WebUI. Privacy wins big here. Nothing leaves your machine.

For Hugo work, this setup changes everything. Shortcodes live in the layouts folder as HTML files with Go template syntax. They can get tricky with parameters and nested content. Describing that verbally to an AI feels odd at first, but models trained on code handle it well.

## Setting Up Your Local LLM for Coding Tasks

First grab Ollama if you haven't. Head to their site and download the installer for your OS. On Mac it integrates nicely with Apple Silicon. Linux folks just curl the script. Windows works too now.

Once installed, open a terminal and pull a model. I started with llama3.1:8b because it balances speed and smarts on my 16GB machine.

```bash
ollama pull llama3.1:8b
ollama run llama3.1:8b
```

That drops you into a chat. But for serious work I prefer a frontend. Open WebUI stacks on Ollama and gives threaded conversations plus code highlighting.

{{< img src="image1.png" alt="Screenshot showing Ollama web UI" class="center-img-400" >}}

I created a new chat dedicated to Hugo projects. Keeps context separate from random experiments.

My friend tried this on an older Intel Mac and switched to the 3B Phi3 model for better performance. It still nailed code generation surprisingly well.

## The Step-by-Step Guide to Building the Shortcode

I wanted a shortcode called "callout" that takes a type parameter like "tip" or "warning" and wraps content in a styled box. Colors change per type, with an icon maybe, but keep it simple. Crucially, no external CSS file. Everything inline or using Hugo's built-in mechanisms.

1. Start with a broad prompt. I typed: "I'm building a Hugo site. Create a custom shortcode named callout.html for the layouts/shortcodes folder. It should take a positional parameter for type like tip, note, warning. Then wrap the inner content in a div with background color, border, and padding based on the type. Use inline styles so no separate CSS needed."

The model output a basic HTML file with Go templates. It used `{{ .Get 0 }}` for the type and `{{ .Inner }}` for content. Styles hard-coded in a style attribute.

2. Test it immediately. Save the file to layouts/shortcodes/callout.html. Add to a markdown post: `{{</* callout tip */>}}This is a tip.{{</* /callout */>}}`

Run hugo server and check. First version looked plain but functional. Backgrounds worked.

3. Refine the prompt. "Make the warning type red border and light red background. Tip green. Add some rounded corners and left border accent. Keep all styles inline on the div."

It updated the code with a switch-like if-else chain in Go templates to set variables for colors.

4. Add polish. "Include a small emoji icon before the content based on type. Warning gets ⚠️, tip gets 💡."

Model inserted it cleanly.

5. Handle defaults. "If no type provided, default to note with blue tones."

Iteration took maybe four rounds. Each time I copied the full previous code into the prompt with "Improve this:" and specific feedback.

{{< img src="image2.png" alt="Diagram of the prompt iteration flow, showing prompt -> code -> test -> refine loop" class="center-img-400" >}}

We ended up with clean, readable code that dropped right in.

## Real-World Use Case: My Personal Tip for Blog Enhancements

Our team maintains a tech blog with dozens of posts. Readability suffered from walls of text. I deployed this callout shortcode across older articles in an afternoon. One post about deployment pitfalls now has warning boxes highlighting common errors. Readers commented it made skimming easier.

In my testing, the green tip boxes drew eyes to pro tips without overwhelming the design. Since styles stay inline, no conflicts with the theme's CSS. Perfect for minimal themes.

A buddy used the same workflow for a figure shortcode with captions and responsive images. He described lazy loading and it added the attributes correctly.

## Pro-Tip Box: Context Management for Better Results

Chain prompts effectively. Always paste the current code version back into the chat when asking for changes. Say "Here's the current shortcode:" then the code, then "Add support for a title parameter that appears in bold above the content."

Models lose details otherwise. I also specify "Use only inline styles, no classes" early to avoid drift.

For complex logic, ask for explanations first. "Explain how Hugo shortcodes handle nested content" primes it.

## Troubleshooting and FAQ

Folks hit snags on Reddit and Hugo forums all the time. Here common ones I see.

**Why does my shortcode show raw HTML instead of rendering?**

You probably used the wrong delimiters in markdown. Hugo defaults to `{{</* */>}}` for safe HTML output. If your theme enables unsafe rendering, `{{%/* */%}}` might work, but stick to the safe ones unless needed.

**The styles don't apply or look off on mobile.**

Inline styles override most theme rules, but check for !important in the theme. Or add higher specificity. In my case, wrapping in an extra div fixed a padding issue.

**Ollama model hallucinates wrong Go template syntax.**

Smaller models do this more. Switch to a larger one like 70B if your hardware allows, or use codellama specifically. I found llama3.1 rarely messed up basic `{{ if }}` blocks.

**How do I make the shortcode work with parameters named instead of positional?**

Prompt for named params. "Use .Get "type" instead of positional." Models adjust easily. Named feels cleaner for multiple options.

This workflow saved me serious time. Local LLMs keep getting better, and for Hugo tweaks, vibe coding them in feels natural now. Try it on your next customization. You might ditch manual styling for good.
