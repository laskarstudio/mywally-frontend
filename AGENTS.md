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

## Design System

Brand: **myWally** — purple + orange. Purple is trust/AI; orange is energy/action.

Tokens defined in `app/globals.css` `@theme inline` — use as Tailwind utility classes:

| CSS variable | Tailwind prefix | Value | Use for |
|---|---|---|---|
| `--color-primary` | `primary` | `#7C3AED` | Buttons, active nav, user chat bubbles, balance card, Wally header |
| `--color-primary-dark` | `primary-dark` | `#6D28D9` | Hover/active state of primary |
| `--color-accent` | `accent` | `#F97316` | Page headers (Send Money, Dashboard, Budget, Member), section labels |
| `--color-accent-dark` | `accent-dark` | `#EA580C` | Hover/active state of accent |
| `--color-surface` | `surface` | `#F5F3FF` | Page backgrounds (lavender tint), progress bar tracks |
| `--color-success` | `success` | `#16A34A` | "Connected" badge, checkmarks, progress fill |
| `--color-danger` | `danger` | `#DC2626` | Destructive actions (Remove Access, "I don't agree") |
| `--color-muted` | `muted` | `#6B7280` | Timestamps, secondary labels, inactive nav |
| `--color-border` | `border` | `#E5E7EB` | Card borders, dividers, input borders |

Conventions:
- **Page wrapper:** `<div className="flex flex-col flex-1">` — fills the mobile shell (never add `min-h-dvh` to page wrappers; the shell already provides it)
- **Scrollable area:** `<div className="flex-1 min-h-0 overflow-y-auto">` — `min-h-0` is required for flex scrolling to work
- **Cards:** `rounded-2xl bg-white shadow-sm`
- **Primary button:** `w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:opacity-80 transition-opacity`
- **Danger button:** `w-full h-[52px] rounded-2xl bg-danger text-white font-bold text-base`
- **Outlined button:** `w-full h-[52px] rounded-2xl border-2 border-primary text-primary font-bold text-base`
- **Disabled button:** add `disabled:opacity-40 disabled:cursor-not-allowed`
- **Text/link button:** `text-primary text-sm font-semibold underline underline-offset-2`
- **Status bar:** always 44px (`h-11`); pass `variant="light"` on colored header backgrounds (accent/primary), `variant="dark"` on white backgrounds
- **Page headers:** most action pages use `bg-accent` (orange) headers; Wally page uses `bg-primary` (purple) header
- **Bottom nav:** 3 items — Home (left), Wally center elevated, Profile (right). Center Wally button: `w-14 h-14 rounded-full bg-primary border-4 border-white -mt-5`. Active item uses `text-primary`; inactive uses `text-muted`
- **Chat bubbles:** bot = `bg-white rounded-2xl rounded-tl-sm shadow-sm`; user = `bg-primary text-white rounded-2xl rounded-tr-sm`
- **Section labels:** `text-accent font-bold` for card section headers (e.g. "Today's Summary")

## Stack Notes

- Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript
- App Router (`app/` directory)
- No dark mode — this is a branded webview with fixed theming
<!-- END:app-context -->
