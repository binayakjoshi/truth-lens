# Dashboard update — integration notes

## Where these go
Paths mirror your repo root, so you can drop them in directly:

- `app/page.tsx` — replaces your current home page
- `app/api/health/route.ts` — new same-origin route the live status chip polls
- `components/dashboard/*.tsx` — new dashboard-only components
- `lib/dashboard.ts` — server-only fetch helpers + shared types

If your project structure differs (e.g. `src/` prefix, different alias), adjust
the `@/...` import paths to match.

## Server vs. client split
- `app/page.tsx` stays a server component — it fetches the user, stats, and
  recent cases directly, in parallel via `Promise.all`.
- `confidence-meter.tsx`, `case-log.tsx`, `stat-card.tsx`, `verdict-badge.tsx`
  are server components — no interactivity, so no client JS shipped for them.
- `animated-counter.tsx` and `live-status-badge.tsx` are the only two
  `"use client"` components — one for the count-up number animation, one
  because it polls for live status on an interval.

## Backend assumptions to verify
Two endpoints are assumed and will fail gracefully (empty/zeroed state) if
they don't exist yet:

- `GET /api/dashboard/stats` → `{ data: { totalScans, manipulatedCount, authenticCount, uncertainCount, avgConfidence } }`
- `GET /api/dashboard/recent-cases?limit=6` → `{ data: CaseRecord[] }` where
  each case is `{ id, filename, verdict, confidence, createdAt }`
- `GET /api/health` (proxied by `app/api/health/route.ts`) → status per
  service

Adjust the URLs/shapes in `lib/dashboard.ts` and the health route to match
your actual API — everything else composes off those types.

## Design direction
The old dashboard was a generic 4-card grid. This version leans into the
"forensic case file" framing already implied by your copy (forensic
workspace, forensic engine, metadata extractor):

- A **Confidence Spectrum** panel is the signature element — every recent
  scan is plotted as a tick on a 0–100 authenticity spectrum instead of a
  generic bar chart, so you can see at a glance whether flagged cases are
  borderline or unambiguous.
- Verdicts render as small rotated "stamp" badges (Authentic / Uncertain /
  Manipulated) rather than plain colored text.
- Stat numbers, case IDs, and timestamps use a monospace font (falls back to
  the browser default monospace if you don't have `--font-mono` defined via
  `next/font`) to read like instrument readouts rather than marketing copy.
- The "System Status" static list became a live, polling status chip in the
  masthead.

The logged-out hero was left as-is since the ask was specifically the
dashboard; happy to revisit that too if useful.
