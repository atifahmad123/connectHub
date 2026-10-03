# Prototype architecture

Connect-Hub is a **frontend UI prototype only**. There is no backend, database, real authentication, API integration, upload service, payment system, or AI model. The existing React/Vite/TypeScript/React Router/Tailwind/Recharts stack is preserved, with no added dependencies.

The production model is **one university per deployment**, using one core codebase and a separate university database and configuration. Super Admin, operator dashboards, university onboarding, global auditing, and the previous shared multi-tenant UI were removed in this revision.

## Instance configuration and isolation

`instances[activeInstanceId]` owns its alumni, applications, content, connections, sessions, notifications, audit history, administrator, and analytics. Normal domain records do not need an institution ID. Each fixture is constructed independently; the reducer copies and updates only the selected dataset.

Air University represents Aerospace & Aviation Campus Kamra. It has 24 approved alumni, one suspended persona, eight pending applicants, one rejected applicant, ten announcements, ten opportunities, and ten session records. Crescent Valley Demo University is explicitly fictional, with 14 approved alumni, one suspended persona, five pending applicants, one rejected applicant, and six announcements. All people, companies, evidence, and historical metrics are synthetic sample content; this demonstration implies no institutional partnership.

The **Prototype Controls** bar exists only for reviewers. It switches configurations, selects one of two roles (**Alumni** or **University Admin**), selects alumni personas, and resets both fixtures. Switching returns to the appropriate dashboard, dismisses dialogs, restores that instance's selected persona, and changes branding and modules. Refresh clears edits. The optional `?demoInstance=crescentValley` deep-link parameter selects that fixture on initial load. No browser storage is used.

## Features and guards

Core registration, approval, profiles, directory, connections, announcements, notifications, dashboard, basic analytics, and audit remain available. Typed optional flags control opportunities, mentorship, AI matching, advanced analytics, messaging, and advanced branding. Air enables the rich modules; Crescent Valley enables core features only. Messaging is disabled in both because the original prototype had no messaging module.

Shared feature guards block disabled direct routes. Role guards use the selected demo role independently of the URL. Pending, rejected, and suspended accounts receive dedicated states. These guards and reducer checks simulate UI behavior; they are not production security.

University Settings edits an explicit allowlist of safe configuration: display name, contact, location, subtitle, logo initials, an accessible preset primary color, registration requirements, and custom field labels/requirements. Entitlements and plan metadata remain read only. The admin UI exposes aggregate session metrics, not private mentorship content, messages, or impersonation.

## Local workflows

- Registration creates a pending record; approval retains its identity and moves it into alumni. Rejection requires a reason and supports editing/resubmission. Decisions generate audit entries and notifications.
- Connections proceed through pending → accepted/declined. Only the recipient can accept; the sender can cancel. Counts derive from accepted relationships, so both personas see the same result.
- Mentorship proceeds through pending → accepted/declined → scheduled → completed, with cancellation, seeded expiry, and per-participant feedback. Scheduling requires a date and HTTP(S) external meeting link. No video calling is implemented.
- Alumni opportunities enter pending review. Admin approval publishes them; rejection records a reason. The board applies type, ownership, and expiry filters. External sample links use `example.com`.
- Announcements respect department, batch, publish date, and expiry. Current publications notify matching approved alumni. Scheduled/expired content remains visible to administrators. There is no background scheduler; date visibility is evaluated when the UI renders.
- Profile edits update shared state. Directory visibility, company visibility, and contact visibility are respected in alumni views. Custom fields are rendered from the active configuration.

Semantic search uses deterministic synonym/tag scoring (for example, “digital banking” → fintech/payments). Recommendations use department and industry relevance. **No Sentence-BERT, embeddings, vector search, or real AI runs.**

Live totals and distributions reflect local state. Historical registration, activity, view, and application trends are labelled illustrative. Uploaded files are never read or transmitted; only filenames are retained.

## Verification

`npm run build` checks TypeScript and builds production assets. `npm run typecheck` is a separate type check. `npm test` covers reducer invariants, state isolation, role and feature guards, registration/resubmission, networking, mentorship, moderation, privacy, notifications, settings/reset, and routes at 1440, 768, 390, and 320 pixels. Browser checks assert no console errors, external requests, or browser storage. The original project does not configure linting.
