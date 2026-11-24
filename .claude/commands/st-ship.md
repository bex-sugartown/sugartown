Read and follow the instructions in `./docs/ship-prompt.md` exactly.

Flag: **$ARGUMENTS**. If it contains `--release`, after the ship steps complete (push, deploy verified, CI concluded `success`), also read and follow `./docs/workflows/release-assistant-prompt.md` in full — do not reimplement release logic here, invoke it as its own gated flow. If no `--release` flag, skip that step entirely.
