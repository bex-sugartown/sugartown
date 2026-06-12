---
name: switch
description: Sync the Sugartown repo across machines (desktop ⇄ laptop). Mirror of /eod — ARRIVE mode safely fetches and fast-forwards your local main from what the other machine pushed; LEAVE mode (/switch out) parks mid-day work on a free handoff branch with no Netlify deploy.
---

Read and follow all instructions in `docs/switch-prompt.md`.

- `/switch` or `/switch in` → ARRIVE mode (default): pull the latest pushed work onto this machine.
- `/switch out` or `/switch leave` → LEAVE mode: hand off mid-day work via a free `handoff/*` branch.
