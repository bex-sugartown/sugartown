Read the file at `/Users/beckyalice/SUGARTOWN_DEV/sugartown/docs/release-assistant-prompt.md` and follow all instructions in it exactly.

Lookback window for signal collection (Step 0): **last $ARGUMENTS hours**. If no argument is provided, default to **24 hours**. Use `git log --since="$ARGUMENTS hours ago"` (or the default) to scope the commit range when no explicit release ref is available.
