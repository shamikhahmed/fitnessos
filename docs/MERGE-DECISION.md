# PulseCap — v1 / v2 merge decision

**Date:** 2026-06-10  
**Decision:** **Single canonical app — this repo (`PulseCap` v4.x)**

## Context

- **PulseCap Pro (v1 lineage)** evolved into the current `PulseCap` repo at v4.5.x.
- **PulseCap v2** was a parallel modular-engine experiment; the separate `PulseCap2` folder no longer exists.
- All active development, GitHub Pages deploy, and Meridian sandboxes point to **`shamikhahmed/PulseCap`**.

## Resolution

| Item | Status |
|------|--------|
| Canonical repo | `https://github.com/shamikhahmed/PulseCap` |
| Live URL | `https://shamikhahmed.github.io/PulseCap/` |
| v2 fork | **Archived** — engines pattern absorbed where useful (`BodyEngine`, `PlanEngine`, `SplitEngine`, etc.) |
| User data | No migration required — v2 never shipped to production |

## Do not

- Create a second live PulseCap repo
- Split engines into a separate deploy without explicit product decision

## Next

- Ship v4.x features on `main` only
- Close approval `apr-002` (unify v1/v2) as **approved — merged into canonical v4**
