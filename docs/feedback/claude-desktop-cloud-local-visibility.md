# Product Feedback — Claude Desktop App: Cloud vs Local Runtime Visibility

**Filed:** 2026-04-04
**Product:** Claude Desktop App (macOS) — Code tab
**Severity:** High (caused data loss)

## Issue

The Claude desktop app's Code tab silently switched from running sessions on the local filesystem (`/Users/beckyalice/...`) to running in a cloud VM (`/home/user/...`) between app updates. There is no visible indicator in the UI showing which runtime environment a session is using.

## Impact

- A cloud session wrote files to `/home/user/sugartown/` instead of the user's local repo
- The session created git branches and pushed to GitHub, but the user expected files to appear locally
- The user was told to `git pull` to get files — a workflow change from prior sessions where files were written directly
- A merge conflict was introduced that persisted overnight
- Multiple sessions of confusion about why files weren't appearing locally

## Expected Behavior

The Code tab should clearly indicate whether the session is running:
1. **Locally** — on the user's filesystem (e.g. green badge: "Local")
2. **Cloud** — in a remote VM (e.g. orange badge: "Cloud VM")

Ideally, the user should be able to choose which runtime to use, or at minimum be warned when the runtime changes.

## Workaround

Added environment detection to the morning housekeeping prompt: check `pwd` at session start and warn if running in a cloud VM.

## Context

The user had been running Claude Code sessions via the desktop app for 2+ months, all on the local filesystem. The switch to cloud was not announced or visible. This is the root cause of the "lost commits" incident documented in SUG-46.
