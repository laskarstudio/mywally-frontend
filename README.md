# myWally

A wallet companion for elderly users — built as a hackathon submission for the TNG Digital FinHack.

myWally is a simplified financial interface embedded within an eWallet context. It is designed for Makcik Aisyah (60–75): a basic smartphone user, risk-averse, with limited income and no one to consult at the moment of a transaction. Instead of adding features, myWally removes complexity and introduces a real-time human support layer at critical moments.

---

## What it does

myWally has five core modules:

**Elderly Mode** — a simplified UI with large buttons, clear balance display, and guided actions. This is the entry point that replaces the overwhelming default eWallet interface.

**Wally (AI Companion)** — a chat-based Q&A assistant. Users can ask "Do I have enough?", "How much did I spend?", or "Add my daughter as a family member" in natural language. The backend runs an agentic loop (tool use + LLM narration) and returns structured rich cards alongside text replies.

**Daily Budget & Feedback** — parents set a daily, weekly, or monthly budget. The dashboard shows how much has been spent, how much remains, and a progress bar with a configurable warning threshold.

**Real-Time Support Layer** — when a transaction is flagged as unusual, the system initiates a caregiver approval flow. The caregiver can approve or block. The elderly user receives a calm, clear outcome — not an alarm.

**Trust & Guidance Layer** — gentle safety tips and reassuring messaging throughout the app. No fear-based copy.

---

## Tech stack

- **Next.js 16.2.4** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript** (strict)
- **TanStack React Query v5** — all server state, mutations, and cache invalidation
- **Zod v4** — runtime API response validation
- **Sonner** — toast notifications

The app is deployed as a **mobile webview inside the TouchNGo eWallet app**. The root layout constrains content to `max-w-[430px]` and uses `min-h-dvh` for correct mobile browser chrome handling. There are no responsive breakpoints — every screen is a phone screen.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The splash screen runs for 2.5 seconds then routes to either the dashboard (if a session exists) or the onboarding consent screen.

---

## User flow

### First-time user (onboarding)

1. **Splash** (`/`) — 2.5s logo screen, then routes based on auth state
2. **Consent** (`/onboarding/consent`) — explains Elderly Mode; user must tick "I agree" to continue
3. **Family setup** (`/onboarding/family`) — a guided chat conversation:
   - "What's your name?" → `parentName`
   - "What's your family member's name?" → `guardianName`
   - "What is their phone number?" → `guardianPhone`
   - Relationship chip selection → `relationshipLabel`
   - Confirmation card → calls `POST /families` (public endpoint)
   - On success: JWT is stored, user is routed to `/dashboard`

`POST /families` is a single public call that creates the family and returns a JWT for the parent. No pre-existing account is needed.

### Returning / session-expired user

If a 401 is returned by any authenticated endpoint, `clearAuth()` is called and the user is sent to `/login` — a session-expired screen with a "Start New Session" button that restarts onboarding.

---

## Routes

| Route | Description |
|---|---|
| `/` | Splash screen |
| `/onboarding/consent` | Elderly Mode consent |
| `/onboarding/family` | Guided chat to collect family + parent info, calls `POST /families` |
| `/dashboard` | Home — balance, budget status, quick actions, family members |
| `/wally` | AI chat companion |
| `/budget` | Budget setup and settings |
| `/send-money` | Send money flow with risk evaluation |
| `/send-money/confirm` | Confirm screen before submitting |
| `/send-money/processing` | Polls transaction state |
| `/send-money/approved` | Approved outcome screen |
| `/send-money/declined` | Declined/blocked outcome screen |
| `/members/[id]` | Family member detail — permissions, connection status |
| `/login` | Session-expired landing page |

---

## API

**Base URL:** `https://wally-api.mywally-app.com`

Authentication uses a JWT stored in `localStorage` under `mywally.jwt`. This is intentionally simplified for the demo — not suitable for production.

Key storage keys:
- `mywally.jwt` — Bearer token
- `mywally.userId` — authenticated user ID
- `mywally.familyId` — family ID used for budget and member endpoints

All authenticated requests go through `app/lib/client.ts` (`apiFetch`), which injects the Bearer token, parses error responses, enforces a 30s timeout, and redirects to `/login` on 401.

### Onboarding

```
POST /families          — public, no auth. Returns JWT + familyId in response.
```

### Authenticated endpoints used

```
GET  /me/dashboard                         — balance, members list
GET  /families/:familyId/budget            — current budget config
PUT  /families/:familyId/budget            — update budget
GET  /me/members/:guardianshipId           — member detail + permissions
DELETE /guardianships/:guardianshipId      — remove a member
POST /me/chat/messages                     — Wally AI chat (60s timeout)
POST /transactions                         — submit a payment for risk evaluation
GET  /transactions/:id                     — poll transaction state
```

---

## Project structure

```
app/
  page.tsx                    — splash screen
  layout.tsx                  — root layout (mobile shell, Toaster, QueryClientProvider)
  providers.tsx               — React Query provider
  dashboard/page.tsx          — home screen
  wally/page.tsx              — AI chat
  budget/page.tsx             — budget settings
  send-money/                 — send money flow (4 screens)
  members/[id]/page.tsx       — member detail
  onboarding/
    consent/page.tsx          — consent gate
    family/page.tsx           — guided onboarding chat
  login/page.tsx              — session expired
  components/
    bottom-nav.tsx            — fixed bottom nav (spacer + fixed element)
    chat-action-card.tsx      — rich card renderer for Wally tool results
    chat-bubble.tsx           — message bubble component
    status-bar.tsx            — mock status bar (light/dark variant)
    consent-check-item.tsx    — check item for consent screen
  lib/
    client.ts                 — apiFetch wrapper, ApiError class
    api.ts                    — all API functions (typed)
    auth.ts                   — localStorage auth helpers
    types.ts                  — Zod schemas + inferred types
    hooks/
      useAccount.ts           — account summary query
      useBudget.ts            — budget query + mutation
      useChat.ts              — Wally chat history + send message
      useMembers.ts           — members list + member detail queries
      useOnboarding.ts        — bootstrapFamily mutation
      useSendMoney.ts         — transfer mutation
      useWally.ts             — (stub)
```

---

## Design system

Brand: purple (`#7C3AED`) + orange (`#EC7C3C`). Purple = trust/AI; orange = energy/action.

Tokens are defined in `app/globals.css` as CSS variables and used directly as Tailwind utility class prefixes: `bg-primary`, `bg-accent`, `text-muted`, `bg-surface`, `bg-success`, `bg-danger`, `text-foreground`.

Minimum tap target: 48×48px. Minimum body text: 16px. Primary values (balance): 20px+.

---

## Demo reset

A "Start Over (Reset Demo)" button appears at the bottom of the dashboard. It calls `clearAuth()` and routes to `/onboarding/consent`, giving each demo session a clean slate without database intervention.

---

## Smoke test (verify API wiring)

```bash
curl -X POST https://wally-api.mywally-app.com/families \
  -H "Content-Type: application/json" \
  -d '{
    "parentName": "Mak Cik Salmah",
    "guardianName": "Nur Radhiah",
    "guardianPhone": "0138155761",
    "relationshipLabel": "Daughter"
  }'
```

A `200` response with `auth.token` confirms the backend is reachable. Use the returned token as `Authorization: Bearer <token>` for all subsequent calls.
