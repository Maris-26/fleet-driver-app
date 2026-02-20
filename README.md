# Fleet Driver App -- Fleeton
Execution-aware fleet driver web app enabling real-time route deviation detection and ETA impact visualization.

## Context
This frontend was developed as part of an industry-sponsored collaboration with T-Mobile for Business.

This repository contains the independently maintained frontend layer only; the full end-to-end system also includes backend microservices and an event pipeline managed in a separate team repository.

## Problem
Fleet plans are static snapshots, but operations are not. As drivers encounter traffic, incident events, and stop-level variability, actual execution drifts from the planned route and schedule. This gap between planned sequence and live execution is execution drift.

When drift is not surfaced early, ETA confidence drops, dispatch decisions become reactive, and customer communication quality degrades. Reliable ETA visibility matters because it affects staffing, exception handling, and whether downstream commitments stay credible.

## What This Frontend Does
- Ingests near-real-time event updates through long-polling (`useEventLongPoll`) and streams payloads into a shared app state.
- Normalizes heterogeneous payload shapes (incident, vehicle status, task/stops variants) into stable frontend models before rendering.
- Buffers alerts when pause mode is enabled, then replays buffered alerts in FIFO order when resumed.
- Visualizes route/task execution state across home, list, map, and message flows, including current/next stop context.
- Displays ETA impact and reroute decision context in alert-driven UI states.
- Applies guardrails such as incident de-duplication, cursor persistence/sanity checks, safe fallback mapping, and error swallowing in event handlers to keep UI responsive.

## Architecture (Frontend scope only)
```text
Backend Event API
		-> useEventLongPoll.ts (cursor + polling loop)
				-> payload normalization/mapping
						-> FleetProvider.tsx (global fleet + alert state)
								-> pages (DriverHome / TaskList / MapPage / Messages / Profile)
										-> components (AlertModal, StopTimelineCard, etc.)
```

Key modules in this repo:
- `src/app/FleetProvider.tsx`: central state orchestration for vehicle, stops, alerts, routing, and history.
- `src/app/useEventLongPoll.ts`: polling client, cursor handling, request sequencing, and event dispatch.
- `src/app/AlertPolicy.ts`: alert behavior mapping by incident severity/context.
- `src/app/logger.ts`: dev-only logging wrapper used across app modules.

## Project Structure
```text
src/
	main.tsx
	index.css
	app/
		App.tsx
		FleetProvider.tsx
		useEventLongPoll.ts
		AlertPolicy.ts
		fleetTypes.ts
		logger.ts
		MessageStore.ts
	pages/
		DriverHome.tsx
		TaskList.tsx
		MapPage.tsx
		Messages.tsx
		Profile.tsx
	components/
		AlertModal.tsx
		StopTimelineCard.tsx
		BottomNavigation.tsx
		DriverHeader.tsx
		LiveAlertHistoryPanel.tsx
	assets/
		icons/
public/
	(runtime-served map/status icons)
```

## Tech Stack
- React 19 + TypeScript + Vite
- `lucide-react` for navigation iconography
- ESLint (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
- TypeScript project references (`tsc -b`) for build-time type checking

## Local Development
```sh
npm install
npm run dev
npm run build
npm run lint
```

Required environment variable names:
- `VITE_AZURE_MAPS_KEY`

Environment files are git-ignored (`.env`, `.env.*` in `.gitignore`).

## Known Limitations / Assumptions
- Backend services and event producer pipeline are out of scope for this repository and are not included here.
- The frontend includes demo-oriented behavior (for example, demo alerts and initialized demo stops) alongside live event handling paths.
- Incoming event schemas are treated as variable; normalization/fallback logic exists because payload fields are not assumed to be perfectly uniform.
- Alert and route state emphasize fast operator feedback in the UI; deeper optimization decisions depend on backend-provided data and may be deferred.
- Some map/status icons remain in `public/` due to dynamic runtime path usage in map sprite registration.

## Roadmap (Short)
- Add explicit schema validation at the event boundary (typed decoders) before state ingestion.
- Introduce finer-grained state slices to reduce rerender surface in high-frequency update scenarios.
- Expand UI-level resilience patterns (retry states, stale-data indicators, and clearer degraded-mode cues).
- Add targeted frontend tests around ingestion normalization, deduplication, and alert buffer replay.
- Standardize asset loading strategy to reduce mixed `public/` vs module-import icon handling where runtime constraints allow.

## Contact
- Frontend: Haichao Xing — hcxing@uw.edu
- Backend: Lily — lily418@uw.edu
