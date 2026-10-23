# Trajectory

A working football player-development prototype for a case competition. Built for Roots Football Academy, a fictional grassroots academy in Pune.

## Run locally

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## The development pathway

1. Open Players and add a player, or choose Arjun Mehta from the sample squad.
2. Record an assessment across technical, physical, tactical and psychological dimensions. Scores follow an illustrative coach-defined rubric.
3. Create an individual development plan. Review the recent assessment, define a specific goal, baseline, target, protocol and deadline, then approve the plan as coach.
4. Create a development cluster and select its players. Individual goals remain attached to each player.
5. Schedule an intervention linked to an approved plan and, optionally, the player's cluster.
6. Open the session, mark it completed, and capture observations.
7. Record a measurement using the same protocol as the baseline.
8. Review updated progress and the player passport, including assessment history, plan, sessions and milestones.

## Features

- Eight connected sections, plus coach and player presentation shortcuts.
- Search by player name or position and filter by U16 or U18 squad.
- Add players and save assessments, IDPs, clusters, sessions and measurements.
- Edit plans, review coach approvals, update session status and observations.
- Progress calculated from dated measurements, capped at 0 to 100 percent.
- Live dashboard counts derived from the same records.
- Responsive layouts, keyboard-accessible dialogs, success messages and validation.
- Printable player passports and JSON data export.
- Browser persistence and a confirmed reset in Demo settings.
- Proposed pricing shown transparently: Standard ₹699, Premium ₹999, Elite ₹1,499 per player per 12-week cycle.

## Demo boundaries

This is a frontend prototype. Data is stored in localStorage under `trajectory-v1`, separately for each browser and origin. It is not a shared academy database. Do not enter real player information into this presentation demo. Coach and player views are presentation modes, not authentication or access-control boundaries.

The cycle overview is an illustrative Week 6 snapshot of Cycle 02, September to December 2026. No automatic improvement, AI diagnosis, validated scouting claims, payment processing, paid API, backend, or banking integration is involved. Proposed prices are not established market rates. Recorded changes do not prove programme causation.

The app runs without secrets or environment variables. Hosting is a static Vite build on Vercel. The repository includes `vercel.json` with SPA fallback and basic response headers. No paid service was provisioned.

## Verification

`npm test` checks the demo data's foreign keys and approval relationships, chronological measurement selection, progress boundaries, initial baselines, persistence, and malformed JSON recovery.

Browser QA exercised a complete new-player pathway through assessment, approved plan, cluster assignment, completed session, measured progress, passport update, refresh persistence, plan editing, and invalid-target validation. See `VERIFICATION.md` for recorded checks and limits.

## Stack and assets

React 19, TypeScript, Vite, Lucide icons and custom responsive CSS. Fonts: DM Sans and Manrope, with local system fallbacks. Training photograph from Unsplash (`photo-1526232761682-d26e03ac148e`), downloaded into `public/images` so the hero does not require a runtime image service. Player identities and records are fictional. Avatar monograms avoid implying that the photographed children are the demo players.
