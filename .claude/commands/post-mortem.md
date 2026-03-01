Read the file at `/Users/beckyalice/SUGARTOWN_DEV/sugartown/docs/post-mortem-prompt.md` and follow all instructions in it exactly.

Use the **Minimal + Surgical** version by default. If I ask for more depth, escalate to the Sharper Systems Lens or Release Discipline version.

Time period to analyse: **last $ARGUMENTS hours**. If no argument is provided, analyse the last 24 hours of git history.

---

After producing the standard post-mortem output (all 5 sections), append the following:

## ✅ Recommendations

Restate each item from **System improvements** (section 5) as a numbered action list in this format:

```
1. [Fix] — [where it lives] — Priority: must-have / nice-to-have
2. ...
```

Then ask the human:

> For each recommendation above — reply with a numbered list:
> - **Now** — implement it in this session
> - **Backlog** — log it (state where: epic, CLAUDE.md, docs/, or other)
> - **Skip** — discard it (state why)
>
> I'll wait for your response before taking any action.

Do not take any action on recommendations until the human responds.
