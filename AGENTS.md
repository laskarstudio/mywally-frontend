<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:app-context -->

# App Context — Mobile Webview inside TouchNGo

This app is deployed as a **webview inside the TouchNGo eWallet mobile app**. We do not have access to the host app; treat this as a standalone mobile app.

## Viewport & Layout Rules

- **Always design mobile-first.** There are no responsive breakpoints — every screen is a phone screen.
- The root layout constrains content to `max-w-[430px]` centered on screen. Never write layout that assumes a wider viewport.
- On a real device (webview), the container fills the full screen naturally.
- On a desktop browser, the same layout is shown centered against a neutral backdrop — "phone in browser". Do not add any desktop-only UI.
- Use `min-h-dvh` (not `min-h-screen`) to handle mobile browser chrome and webview height correctly.
- Account for safe-area insets (`env(safe-area-inset-*)`) on notched devices where relevant (e.g. bottom nav, fixed footers).

## Product & UX Rules

- **Language:** English. UX copy should be in English unless the user explicitly provides copy in another language.
- **Persona:** Makcik Aisyah (60–75) — basic smartphone user, risk-averse, limited income, no one to consult at the moment of a transaction. Design for her, not for tech-savvy users.
- **Tap targets:** Minimum 48×48px. Prefer 56–64px for primary actions.
- **Typography:** Minimum 16px body text, 20px+ for primary values (e.g. balance). Use weight and size hierarchy, not color alone.
- **One question per screen.** Every screen must answer exactly one user need.
- **No jargon.** Avoid financial or technical terms without plain-language equivalents.
- **Calm over alarm.** Never use fear-based messaging. Warnings must be reassuring and actionable, not alarming.
- **Support over isolation.** The key differentiator is the Real-Time Support Layer — when a risky transaction is detected, the system triggers a caregiver approval flow. UX for this flow must be clear, calm, and binary (approve / block).
- **Feedback over navigation.** Prefer inline responses and confirmations over new pages where possible.

## MVP Modules (for reference)

1. **Elderly Mode** — simplified UI, large buttons, clear balance
2. **Wally** — voice/button Q&A ("Do I have enough?", "How much did I spend?")
3. **Daily Budget & Feedback** — budget setup, Safe/Near/Exceeded status
4. **Real-Time Support Layer** ⭐ — unusual transaction detection → AI call to caregiver → approve/block → calm response to user
5. **Trust & Guidance Layer** — gentle tips, reassurance messaging

## Stack Notes

- Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript
- App Router (`app/` directory)
- No dark mode — this is a branded webview with fixed theming
<!-- END:app-context -->
