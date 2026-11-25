---
name: st-switch
description: Sync the Sugartown repo across machines (desktop ⇄ laptop). Mirror of /st-ship — ARRIVE mode safely fetches and fast-forwards your local main from what the other machine pushed; LEAVE mode (/st-switch out) parks work on a free handoff branch with no Netlify deploy.
---

Read and follow all instructions in `docs/switch-prompt.md`.

- `/st-switch` or `/st-switch in` → ARRIVE mode (default): pull the latest pushed work onto this machine.
- `/st-switch out` or `/st-switch leave` → LEAVE mode: hand off work-in-progress via a free `handoff/*` branch.
