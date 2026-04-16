/**
 * buildInfo.js — Build-time constants injected by Vite's define plugin.
 *
 * __APP_VERSION__  parsed from CHANGELOG.md (latest ## [x.y.z] heading),
 *                  falls back to package.json version.
 * __BUILD_DATE__   UTC ISO date at build time (YYYY-MM-DD).
 *
 * Both values are replaced as string literals at compile time — they are
 * not runtime reads. In local dev, Vite evaluates vite.config.js fresh
 * on each server start, so the values reflect the current state.
 *
 * SUG-65 — Phase 2
 */

/* globals __APP_VERSION__, __BUILD_DATE__ */
export const APP_VERSION = `v${__APP_VERSION__}`
export const BUILD_DATE = __BUILD_DATE__
