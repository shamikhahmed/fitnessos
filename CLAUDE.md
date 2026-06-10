# FitnessOS Pro v4 — CLAUDE.md

## Project
- Live: https://shamikhahmed.github.io/FitnessOS
- Repo: github.com/shamikhahmed/FitnessOS
- Local: ~/Desktop/Projects/fitnessos
- Owner: Shamikh Ahmed, Karachi PK

## Stack (never change these rules)
- Vanilla JS only — no React, no frameworks, no build tools
- Pure localStorage via S object — NO IndexedDB
- DOMContentLoaded boot — NEVER window.load or async
- All screens: reg('name', function(data) { return htmlString; })
- Router: go('screenName') — always synchronous
- No CSP meta tags — ever
- node --check ALL JS before every git commit

## File Structure
index.html
css/base.css — variables, themes, keyframes, reset
css/components.css — all UI components
css/layout.css — shell, nav, topbar, modal
js/storage.js — S object
js/app.js — router, engines, helpers, nav
js/modules/onboarding.js — 12-step onboarding + intro slides
js/modules/dashboard.js — dashboard + explore grid
js/modules/workout.js — exercise DB (160+), logger
js/modules/bodymap.js — body visualiser
js/modules/coach.js — Smart Coach screen
js/modules/progress.js — charts, PRs
js/modules/nutrition.js — meals, macros, supplements
js/modules/recovery.js — readiness, sliders
js/modules/settings.js — 7-tab settings

## Screen Flow (new users)
intro (4 slides) → onboarding (12 steps) → dashboard
Nav hidden during: intro, onboarding

## Key Engines (all in app.js)
ReadinessEngine.score() — 0-100
MuscleEngine.status() — recovery array
StreakEngine.get() — consecutive days
ProgEngine.epley(w,r) — 1RM estimate
CoachEngine.insights() — coaching messages
SplitEngine.getSplitDay() — today's workout
WeightEngine.suggest(name, user) — weight recommendation
SupplementEngine.getDueNow() — due supplements

## Themes (6 total)
carbon (default), stealth, forest, arctic, electric, sunset
Applied via data-theme on html element
User preference saved to S.g('user.theme')

## Shamikh's Rules
- Electric/Carbon dark theme aesthetic
- Animated canvas orbs always on
- Premium glassmorphism everywhere
- Use Smart Coach naming in user-facing copy (not "AI Coach").
- No questions — just build it
- Test on iPhone Safari 390px viewport
- Commit and push after every working build
- node --check before every commit
