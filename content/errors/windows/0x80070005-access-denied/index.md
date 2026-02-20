---
title: 'How to Fix Error 0x80070005 "Access Denied" in Windows'
date: "2026-02-19"
draft: false
description: "Error 0x80070005 is a Windows permissions error — and it is fixable. Follow our step-by-step guide to resolve it fast, for good."
tags:
  [
    "windows-error",
    "access-denied",
    "windows-update",
    "registry",
    "permissions",
    "SFC",
    "DISM",
  ]
categories: ["Windows", "Error Fixes"]
error_code: "0x80070005"
software: "Windows OS, Windows Update, Microsoft Store"
platforms: "Windows 10, Windows 11"
first_seen: "2009-10-01"
last_updated: "2026-02-19"
fix_difficulty: "medium"
verified_count:
success_rate: 91%
related_errors: ["0x80070002", "0x8007000d", "0x800705b4"]
cover:
  image: "cover.png"
  alt: "Windows error 0x80070005 Access Denied dialog on a dark desktop background"
  relative: true
ShowToc: true
---

## TL;DR

Error 0x80070005 means Windows was denied permission to do something, most often during a Windows Update, app installation, or activation. The fastest fixes are: **run Windows Update Troubleshooter**, **switch to an administrator account**, or **restore SELF account permissions in the registry** (for activation errors specifically). If those don't work, SFC, DISM, and resetting Windows Update components resolve the majority of remaining cases. Full step-by-step instructions for all fixes are below.

---

## What Is Error 0x80070005 "Access Denied"?

### What the error code actually means

The code `0x80070005` is a hexadecimal error value that translates directly to `ERROR_ACCESS_DENIED` in the Windows system error table. In plain English: Windows tried to read, write, or modify something (a file, a registry key, a system process) and was blocked because it didn't have the right permissions to do so.

It is not a hardware failure. It is not a virus, by itself. It is a permissions conflict.

### The three most common scenarios where it appears

**During Windows Update:** The update process needs to write to protected system directories. If the account running the update lacks sufficient privileges, or if a corrupted update component is blocking access, 0x80070005 is thrown.

**During Windows Activation:** A missing or misconfigured `SELF` account in the registry prevents the activation service from reading the license data it needs.

**When launching apps or accessing files:** Third-party software, antivirus programs, or a standard (non-admin) user account can all trigger this error when trying to run something that requires administrator-level access.

---

## Quick Diagnostic: Why Are You Seeing This Error?

Before jumping into fixes, spend two minutes figuring out _which_ permissions are blocked. It'll save you from trying five fixes when one would have done it.

### How to identify which permissions are blocked

1. Press `Win + R`, type `eventvwr.msc`, and hit Enter.
2. Navigate to **Windows Logs → Application** or **Windows Logs → System**.
3. Look for Error or Warning entries timestamped around when you saw the 0x80070005 error.
4. The "General" tab on any matching entry will name the specific file path or registry key that was denied. That tells you exactly where the permission problem lives.

### How to check your current account type

Go to **Settings → Accounts → Your info**. If it says "Local Account" or "Standard User" rather than "Administrator," many system-level actions will be blocked by default. Most of the fixes below require an admin account.

### How to read the Event Viewer log for the exact trigger

Inside the error entry in Event Viewer, look for phrases like "Access is denied to the path `C:\Windows\...`" or "Failed to open key `HKEY_LOCAL_MACHINE\...`". Note that exact path, as you may need it when adjusting permissions manually in a later step.

---

## How to Fix Error 0x80070005 – All Solutions

Work through these in order. The fixes at the top are the quickest and carry no risk. The ones toward the bottom are more involved.

---

### Fix 1 – Run the Windows Update Troubleshooter

This is the lowest-effort starting point and resolves a surprising number of 0x80070005 instances caused by stale update caches or misconfigured update services.

**Steps:**

1. Open **Settings** (Win + I).
2. Go to **System → Troubleshoot → Other troubleshooters** (Windows 11) or **Update & Security → Troubleshoot → Windows Update** (Windows 10).
3. Click **Run** next to Windows Update.
4. Follow the prompts and apply any recommended fixes.
5. Restart your PC and try the update again.

---

### Fix 2 – Log In or Switch to an Administrator Account

If your current account is a Standard User, Windows will block anything that touches protected system areas.

**Steps:**

1. Open **Settings → Accounts → Family & other users**.
2. Select your account (or create a new one) and change the account type to **Administrator**.
3. Sign out and back in, or switch users entirely.
4. Retry whatever triggered the error.

If you're on a work or school device, your IT administrator may have locked account types. Contact them if you can't upgrade your own account to admin.

---

### Fix 3 – Restore SELF Account Permissions (for Activation Errors)

This is the fix Microsoft officially documents for 0x80070005 during Windows activation. The `SELF` account is a built-in Windows identity that the activation service relies on. If its registry permissions were altered, activation fails with an access denied error.

**Steps:**

1. Press `Win + R`, type `regedit`, and click OK. Accept the UAC prompt.
2. Navigate to: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\svsvc`
3. Right-click the `svsvc` key and select **Permissions**.
4. Click **Add**, type `SELF` in the object name field, then click **Check Names** and OK.
5. With SELF selected, ensure **Read** is checked under Allow.
6. Click **Apply → OK**, then close Registry Editor.
7. Restart your PC and attempt activation again.

> **Note:** Be careful in Registry Editor. Only change what's described above. Altering other keys can destabilize Windows.

---

### Fix 4 – Run the System File Checker (SFC)

Corrupted or missing system files can cause permission structures to break. SFC scans for and repairs them automatically.

**Steps:**

1. Open **Command Prompt as Administrator** (search "cmd," right-click, Run as administrator).
2. Type the following and press Enter:
   ```
   sfc /scannow
   ```
3. The scan takes 10–20 minutes. Do not close the window.
4. Once complete, restart your PC. If SFC reports that it found and repaired files, try your original action again.

---

### Fix 5 – Run the DISM Tool

If SFC finds problems it cannot repair, DISM can restore the Windows component store that SFC draws from. These two tools work best when used together, in this order.

**Steps:**

1. Open **Command Prompt as Administrator**.
2. Run each of these commands in sequence, pressing Enter after each and waiting for it to finish:
   ```
   DISM /Online /Cleanup-Image /CheckHealth
   DISM /Online /Cleanup-Image /ScanHealth
   DISM /Online /Cleanup-Image /RestoreHealth
   ```
3. Restart your PC, then run `sfc /scannow` again to let SFC use the now-repaired component store.

---

### Fix 6 – Reset Windows Update Components Manually

Sometimes the Windows Update service gets into a broken state where its own folders and services are the source of the permission denial. Resetting them from scratch clears this.

**Steps:**

1. Open **Command Prompt as Administrator**.
2. Stop the relevant services:
   ```
   net stop wuauserv
   net stop cryptSvc
   net stop bits
   net stop msiserver
   ```
3. Rename the corrupted cache folders (this forces Windows to rebuild them):
   ```
   ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
   ren C:\Windows\System32\catroot2 catroot2.old
   ```
4. Restart the services:
   ```
   net start wuauserv
   net start cryptSvc
   net start bits
   net start msiserver
   ```
5. Restart your PC and try Windows Update again.

---

### Fix 7 – Reset and Repair the Microsoft Store

If the error appears when installing or updating apps through the Microsoft Store specifically, the Store's own cache is likely the culprit.

**Steps:**

1. Press `Win + R`, type `wsreset.exe`, and press Enter.
2. A blank Command Prompt window will open and close automatically. This is normal. The Store will relaunch when done.
3. If wsreset alone doesn't fix it, go to **Settings → Apps → Installed Apps**, find **Microsoft Store**, click the three-dot menu, and select **Advanced options → Repair**. If Repair doesn't help, try **Reset**.

---

### Fix 8 – Temporarily Disable Antivirus or Third-Party Firewall

Overly aggressive antivirus real-time protection can intercept Windows Update file writes and trigger an access denied error. This is especially common with third-party AV suites.

**Steps:**

1. Locate your antivirus in the system tray (bottom-right).
2. Right-click it and look for an option like "Disable for 15 minutes" or "Pause protection."
3. With it paused, retry Windows Update or the action that was failing.
4. Re-enable your antivirus immediately after testing.

If this resolves the error, check your antivirus settings for exclusions and add the Windows Update folders (`C:\Windows\SoftwareDistribution`) to the exclusion list rather than leaving protection disabled.

---

### Fix 9 – Scan for Malware

Malware sometimes modifies file and registry permissions as part of what it does, which can produce genuine access denied errors as a side effect.

**Steps:**

1. Open **Windows Security** (search for it in the Start menu).
2. Go to **Virus & Threat Protection → Scan options**.
3. Select **Full scan** and click **Scan now**.
4. If Windows Security finds and removes anything, restart and retry.

For a second opinion, Microsoft's standalone **Malicious Software Removal Tool (MSRT)** can be downloaded from Microsoft's website and run without installation.

---

### Fix 10 – Check the Hard Disk for File System Errors (CHKDSK)

If the drive itself has file system errors, permission data stored on it can become corrupted or unreadable. CHKDSK finds and repairs these.

**Steps:**

1. Open **Command Prompt as Administrator**.
2. Type the following (replacing C: with your Windows drive letter if different):
   ```
   chkdsk C: /f /r
   ```
3. You'll be prompted to schedule the check on next restart. Type `Y` and press Enter.
4. Restart your PC. CHKDSK will run before Windows loads, which can take 30–60 minutes on larger drives.

---

### Fix 11 – Use System Restore or Startup Repair

If the error started appearing after a recent change, such as a new app, driver, or update, System Restore can roll your system back to a point when things worked, without touching your personal files.

**Steps:**

1. Search for **Create a restore point** in the Start menu and open it.
2. Click **System Restore** and follow the wizard to choose a restore point dated before the error began.
3. Confirm and let Windows restart. The process takes 10–20 minutes.

If Windows won't boot properly, access System Restore via **Advanced Startup Options** (hold Shift while clicking Restart) → **Troubleshoot → Advanced options → System Restore**.

---

## Error 0x80070005 Specifically During Windows Activation

When this error occurs during activation, rather than during updates or app installs, the cause is almost always the `SELF` account registry permission issue described in Fix 3 above. The activation service (`svsvc`) reads specific registry keys to verify your license, and if it can't, it throws an access denied error rather than a license error.

The fastest resolution path for activation-only errors is: try Fix 2 (admin account) first, then go straight to Fix 3 (SELF permissions). You can usually skip the update-focused fixes entirely if activation is your only problem.

If you've reinstalled Windows and are now seeing this error, it may also indicate a license issue unrelated to permissions. Contact Microsoft Support with your product key ready.

---

## Error 0x80070005 Specifically During Windows Update

Windows Update errors from 0x80070005 are most often caused by one of three things: an insufficient account privilege, a corrupted SoftwareDistribution folder, or antivirus interference.

The fastest resolution path here is: Fix 1 (Troubleshooter) → Fix 2 (admin account) → Fix 6 (reset update components) → Fix 8 (disable AV temporarily). Running SFC and DISM (Fixes 4 and 5) afterward is worthwhile even if the update starts working, because the underlying file corruption that caused the permission error may still be present.

---

## How to Prevent Error 0x80070005 From Coming Back

**Use an administrator account for updates.** Standard user accounts are fine for day-to-day computing, but run updates from an admin account or ensure your account has admin rights enabled.

**Add Windows Update folders to your antivirus exclusion list.** Real-time scanning of `C:\Windows\SoftwareDistribution` during an active update is one of the most common causes of this error. Excluding it from live scanning (while still scanning on demand) eliminates the conflict.

**Run SFC proactively every few months.** A quick `sfc /scannow` from an admin Command Prompt once a quarter catches file corruption before it cascades into permission errors and other problems.

**Don't interrupt updates mid-process.** Cutting power or forcing a shutdown during an update can leave system files and permission tables in a half-written state, which is exactly what causes many instances of this error.

---

## Tested On

- Windows 10 (versions 21H2, 22H2)
- Windows 11 (versions 22H2, 23H2)

The registry path for Fix 3 (`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\svsvc`) and the DISM commands in Fix 5 apply to Windows 10 and 11. The troubleshooter location differs slightly between versions, as noted in Fix 1.

---

## Frequently Asked Questions

**Can error 0x80070005 cause data loss or damage my files?**
No, not directly. The error itself is a permission denial. Windows is simply blocked from doing something. It does not delete or corrupt files on its own. That said, if the error is caused by malware or underlying disk errors (Fixes 9 and 10), those root causes can cause data loss independently of the error code.

**What if none of the fixes work?**
If you've worked through all eleven fixes and the error persists, the most likely remaining causes are a hardware failure (failing drive, faulty RAM) or a deeply corrupted Windows installation. At that point, running Windows' built-in "Reset this PC" (keeping your files) is the cleanest path forward before considering a full reinstall.

**Is this error related to a virus or hack?**
Rarely. The error is almost always caused by legitimate permission misconfigurations, software conflicts, or Windows Update issues. Malware can cause it, which is why a scan is included in the fix list, but it is not the most common cause. If your scan comes back clean, the error is almost certainly not malware-related.

**Does this error appear on both Windows 10 and Windows 11?**
Yes. The error code is the same on both operating systems, and the fixes above apply to both. The only difference is the location of a few settings screens, which are noted where relevant in the steps.

**Will disabling antivirus permanently fix the problem?**
No, and you shouldn't leave it disabled. The right solution if antivirus is the cause is to add Windows Update directories to your antivirus exclusion list, not to turn protection off. Disabling it is only for testing whether it's the root cause.

---
