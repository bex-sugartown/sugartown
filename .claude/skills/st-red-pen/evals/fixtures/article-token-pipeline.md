# The Token Pipeline Was a Bully (So I Replaced It)

For most of this spring, every colour on sugartown.io was a hostage negotiation. Two hand-edited CSS files, one for the web app and one for the design system package, each convinced it was the source of truth. Change a value in one and the other would wait, patiently, to embarrass you in Storybook.

I'm excited to announce that's over.

The design system now runs on 900 tokens generated from a single JSON source. We leverage Style Dictionary v4 to build both CSS outputs from `tokens/source/tokens.json`, so the two files can no longer drift — they are stamped from the same mould on every build.

I wrote the build script myself over a weekend, wiring the Style Dictionary config to emit both targets and adding a pre-commit hook that blocks anyone (usually me) from editing the generated files directly.

The migration itself was anticlimactic in the best way. I think maybe this could possibly be the most boring infrastructure change I've ever enjoyed. The validator ran, the diff was enormous, and nothing broke.

There is a lesson here about single sources of truth, but you already know it. The interesting part is how long I tolerated the duplicated files before fixing them, because each individual sync was only ever a two-minute job. Two minutes, forty times, plus the three incidents where the copies disagreed in production. The arithmetic was never in the old system's favour. I just hadn't done it.

If you're maintaining a mirrored pair of anything by hand, do the arithmetic.
