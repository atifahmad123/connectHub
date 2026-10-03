# Connect-Hub frontend prototype

An institution-owned alumni network, refactored from the existing React prototype. One codebase represents one university per deployment. This demo uses React state to demonstrate two independent configurations.

## Run

Requires Node.js 20.19+ or 22.12+ and npm. Dependencies are already installed in this workspace.

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:5173. `npm.cmd` avoids PowerShell execution-policy restrictions on Windows.

```powershell
npm.cmd run build
npm.cmd run preview
npm.cmd run typecheck
npm.cmd test
```

`npm test` runs domain checks and Playwright acceptance checks in installed Microsoft Edge. It starts and stops a local Vite server if one is not already running. Screenshots are written to `test-results/`. There is no lint script or lint dependency configured.

## Demonstrate

1. Open **Prototype Controls** with Air University selected. The initial persona is Ayesha Nadeem.
2. Choose University Admin, review an applicant's evidence, and approve or reject with a reason. Dashboard totals and audit history update.
3. Choose Alumni, search the directory, and send Ahmed Raza a connection request.
4. Select Ahmed Raza as the demo persona. Accept Ayesha's request under Connections → Received requests.
5. Return to Ayesha, open Ahmed's profile, and request a mentorship conversation. As Ahmed, accept under Pending, then schedule under Upcoming. Either participant can mark the scheduled session complete and leave feedback.
6. Submit an opportunity as an alumnus, approve it in the admin moderation queue, and see it published on the alumni board.
7. Publish an announcement. Matching alumni receive the update and notification.
8. View Analytics, Audit log, and University settings. **Plan & features is read only.**
9. Switch to Crescent Valley Demo University. Observe the plum branding, different alumni and administrator, custom Faculty/Alumni Chapter fields, and core-only navigation.
10. Exercise unavailable routes, then reset both datasets using **Reset demo state**.

Pending, rejected, and suspended personas are available at the end of each persona list. Rejected applicants can edit and resubmit their existing registration. Refreshing resets local edits; switching instances preserves their separate in-memory state.

For a direct disabled-route demonstration after a full page load, use:

`http://127.0.0.1:5173/alumni/sessions?demoInstance=crescentValley`

This query is a prototype fixture selector, not a production university selector. Direct admin routes show Access Denied while the selected demo role is Alumni.

## Structure

- `src/types/domain.ts`: domain and configuration types.
- `src/data/`: separate Air University and Crescent Valley fixtures, built independently.
- `src/config/instanceSeeds.ts`: fixture registry and fresh state copies.
- `src/state.ts` / `src/store.tsx`: typed reducer and React context.
- `src/App.tsx` / `src/System.tsx`: prototype controls, shell, routes, guards, and system states.
- `src/Alumni.tsx` / `src/pages/`: alumni networking screens and workflows.
- `src/Admin.tsx`: approvals, announcements, moderation, analytics, audit, and settings.
- `src/Public.tsx` / `src/components/ProfileFields.tsx`: institution-specific public pages and reusable dynamic forms.
- `src/ui.tsx`, `src/styles.css`, `src/refinements.css`: preserved UI foundation with responsive, accessible refinements.

See [PROTOTYPE_ARCHITECTURE.md](PROTOTYPE_ARCHITECTURE.md) for boundaries and implementation decisions.
