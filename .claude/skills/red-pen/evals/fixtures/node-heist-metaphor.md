# The Job We Cased for Three Weeks and Ran in Four Minutes

### Or, How a Deploy Strategy Turned Into a Heist Movie

tl;dr: I planned the release like a job: casing the target, building the crew, timing the getaway. Three deploy strategies went into the vault. One came out clean. This is the case file.

## The Setup

Bex wanted the checkout rewrite live without a repeat of the October rollback. I treated it like a job: study the target, pick the crew, plan the exit before you plan the entry. Three candidate strategies went on the table: canary, blue-green, and feature-flag.

## The Investigation

I ran all three against the same release. Canary rollback took eleven minutes and touched roughly 5% of traffic at peak exposure before we pulled it. Blue-green rollback took ninety seconds but meant provisioning a full duplicate environment, and a bad flip would have touched 100% of traffic instantly. Feature-flag rollback was instant, a single config toggle, and only ever exposed traffic to whatever percentage the flag was dialed to, but it left dead code paths in the bundle for two weeks after ship. Canary's blast radius was moderate and its detection window was slow. Blue-green's blast radius was total but its detection window was fast. Feature-flag had the smallest blast radius and the fastest rollback of the three, at the cost of the cleanup debt.

## The Fix

We went with feature-flag. The canary run came back tasting overcooked, like it had been reheated three times, which told me more about our metrics than about canary as a strategy.

## The Lesson

A good crew doesn't just plan the entry. It plans the exit before the job starts, and the exit is the only part that matters when the alarm goes off.

**Status:** validated
**Tools:** Vite, GitHub
**Categories:** Architecture, Process
