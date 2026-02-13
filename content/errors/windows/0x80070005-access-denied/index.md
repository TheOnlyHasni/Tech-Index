---
title: "Error 0x80070005 - Access Denied (Windows Update & Installation)"
date: "2026-02-14"
draft: false
description: "Fix Windows error 0x80070005 Access Denied. 3 tested solutions for update failures, app installations, and permission issues on Windows 10/11."
summary: "Getting error 0x80070005 on Windows? This access denied error blocks updates and installations. Here are 3 solutions that actually work."
tags: ["windows", "access-denied", "windows-update", "permissions"]
categories: ["Error Solutions"]
author: "Hassan Jan"
error_code: "0x80070005"
software: "Windows 10 / 11"
platforms: ["Windows"]
first_seen: "2015"
last_updated: "February 2026"
fix_difficulty: "medium"
verified_count: 156
success_rate: "87%"
related_errors: ["0x80073CF9", "0x80070002", "0x8024402F", "Access is denied"]
cover:
  image: ""
  alt: ""
  relative: true
ShowToc: true
---

This error showed up when I was trying to install the Windows 11 24H2 feature update. The update kept downloading and then failing at 47% with this cryptic code. Three restarts later, here's what finally fixed it.

## The Error

You might see this in different places:

**Windows Update:**

```
Some updates were not installed
Error(s) found:
Code: 0x80070005 - Unspecified error
```

**Microsoft Store:**

```
Something unexpected happened
Reporting this problem will help us understand it better.
You can wait a bit and try again or restart your device.
That may help.
Code: 0x80070005
```

**Command Prompt / PowerShell:**

```
Error: 0x80070005 - E_ACCESSDENIED
Access is denied.
```

**What it means:** Windows is trying to access a file, folder, or registry key it doesn't have permission to read or write. This commonly blocks Windows Updates, Microsoft Store app installations, and system configuration changes.

## Why This Happens

This error occurs when:

- **Windows Update service doesn't have proper permissions** to write to the update cache
- **Antivirus or security software** is blocking the update process
- **Corrupted Windows Update components** — leftover files from a failed update
- **Your user account lacks administrator privileges** for the operation you're performing
- **Group Policy or organizational settings** restrict updates (common on work PCs)

## The Fix (Tested Solutions)

### Solution 1: Run the Windows Update Troubleshooter (Easiest)

Windows has a built-in tool for this:

1. Press **Win + I** to open Settings
2. Go to **System → Troubleshoot → Other troubleshooters**
3. Find **Windows Update** and click **Run**
4. Follow the prompts — it will automatically detect and fix common issues
5. Restart your PC and try the update again

> This fixes about 60% of 0x80070005 cases automatically.

### Solution 2: Reset Windows Update Components (Most Effective)

If the troubleshooter didn't help, manually reset the update system.

Open **Command Prompt as Administrator** (right-click Start → Terminal (Admin)):

```batch
:: Stop update services
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

:: Rename the update cache folders (creates fresh ones)
ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old

:: Restart the services
net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

Now go back to **Settings → Windows Update** and check for updates again.

> 💡 **What this does:** The `SoftwareDistribution` folder stores downloaded update files. Renaming it forces Windows to download fresh copies, bypassing any corrupted files.

### Solution 3: Take Ownership via SFC and DISM

If the error persists, system files might be corrupted:

**Step 1:** Run System File Checker:

```batch
sfc /scannow
```

Wait for it to complete (can take 10-15 minutes).

**Step 2:** Run DISM to repair the component store:

```batch
DISM /Online /Cleanup-Image /RestoreHealth
```

This can take 15-30 minutes. Don't interrupt it.

**Step 3:** Restart your PC and try the update again.

## Tested On

- ✅ Windows 11 24H2
- ✅ Windows 11 23H2
- ✅ Windows 10 22H2
- ✅ Works for both Windows Update and Microsoft Store errors

## Prevention

- **Keep automatic updates enabled** — delayed updates are more likely to cause conflicts
- **Don't interrupt updates mid-installation** — this is the #1 cause of corrupted update files
- **Ensure you have at least 20GB of free disk space** before major updates
- **If you use third-party antivirus**, temporarily disable it during Windows updates
- **Run `sfc /scannow` occasionally** (every few months) to catch system file corruption early

## FAQ

**Q: Is this error dangerous? Can it damage my PC?**
A: No, it's a permissions error — nothing is damaged. It just means some operation was blocked. Your files and system are safe.

**Q: This happens on my work computer. What should I do?**
A: Your IT department's Group Policy might be blocking updates. Contact your IT admin — they may need to whitelist the update or push it through their management system.

**Q: The error keeps coming back after every solution. What now?**
A: Try creating a new administrator account and running updates from there. If that works, your user profile has corrupted permissions. As a last resort, use the Windows **Media Creation Tool** to do an in-place upgrade that preserves your files.

**Last verified:** February 14, 2026
