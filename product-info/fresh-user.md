Deployed. Here's the **revised FE prompt** — fresh-user, no demo data, no pre-existing accounts.

---

# FE Prompt — myWally fresh-user onboarding (judges open the app cold)

You are wiring a fresh-user onboarding flow. **No prior account exists.** When the judge opens the app, they should be able to:

1. Tell us their name (the parent)
2. Add one family member (the guardian)
3. End up signed in with a real JWT, dashboard works, send-money works

**No mock data, no localStorage seeding, no `agent@claude.test`.**

## API base

`https://wally-api.mywally-app.com`

## The single onboarding call

`POST /families` is **public** (no auth required) and now returns a JWT for the parent in the response. One round-trip = fresh family + signed-in parent.

```ts
// app/lib/api.ts — REPLACE the stubbed addFamilyMember/completeOnboarding etc

export type OnboardingPayload = {
  parentName: string; // required — the user themselves
  guardianName: string; // required — new family member's name
  guardianPhone: string; // accepts "0138155761" or "+60138155761"
  relationshipLabel?: string; // optional — "Daughter", "Son", etc
};

export type OnboardingResult = {
  familyId: string;
  parent: { id: string; fullName: string; phone: string };
  guardian: {
    id: string;
    fullName: string;
    phone: string;
    relationshipLabel: string;
  };
  auth: { token: string; tokenType: "Bearer"; userId: string };
};

const API_BASE = "https://wally-api.mywally-app.com";

export async function bootstrapFamily(
  p: OnboardingPayload,
): Promise<OnboardingResult> {
  const res = await fetch(`${API_BASE}/families`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parentName: p.parentName,
      guardianName: p.guardianName,
      guardianPhone: p.guardianPhone,
      relationshipLabel: p.relationshipLabel,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Network error" }));
    throw new Error(err.message || "Failed to onboard");
  }
  const data: OnboardingResult = await res.json();
  // PERSIST the JWT + userId — every subsequent API call uses this
  localStorage.setItem("mywally.jwt", data.auth.token);
  localStorage.setItem("mywally.userId", data.auth.userId);
  localStorage.setItem("mywally.familyId", data.familyId);
  return data;
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("mywally.jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

## What the chatbot needs to ask (additions to current screen)

Current chatbot only asks: **phone, relationship, consent.** That's not enough — backend needs `parentName` and `guardianName` too.

Add **two questions** at the start:

```
Bot: "First, what's your name?"
User: "Mak Cik Salmah"   ← parentName

Bot: "Nice to meet you. Now let's add your family member who will help keep you safe."
Bot: "What's their name?"
User: "Nur Radhiah"      ← guardianName

Bot: "What is their phone number?"
User: "0138155761"       ← guardianPhone

Bot: "What is your relationship with them?"
User: "Children"         ← relationshipLabel

Bot: "Do you consent to share your data with them?"
User: [I agree]          ← gate, FE-only

→ call bootstrapFamily(...)
```

## After successful onboarding

The JWT in `localStorage` powers every other route:

```ts
// All subsequent calls
const res = await fetch(`${API_BASE}/me/chat/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json", ...getAuthHeaders() },
  body: JSON.stringify({ text: userInput, history: chatHistory }),
});
```

| Route in your FE   | Real API call after onboarding                                     |
| ------------------ | ------------------------------------------------------------------ |
| `/dashboard`       | `GET /me/dashboard` — balance, today's spend, members              |
| `/budget`          | `GET /families/:familyId/budget`, `PUT /families/:familyId/budget` |
| `/members`         | `GET /families/:familyId` — guardian list with permissions         |
| `/wally` (chatbot) | `POST /me/chat/messages`                                           |
| `/send-money`      | `POST /transactions` (use the existing `/sim/merchant` shape)      |

Pull `familyId` from `localStorage.getItem('mywally.familyId')` — it was saved by `bootstrapFamily`.

## "Sign out / start over" for judges

Add a button on the dashboard or settings that does:

```ts
function resetSession() {
  localStorage.removeItem("mywally.jwt");
  localStorage.removeItem("mywally.userId");
  localStorage.removeItem("mywally.familyId");
  location.href = "/onboarding/family";
}
```

This way each new judge gets a clean slate without DB intervention.

## Phone format

Backend normalizes any of these — surface error message verbatim if 400:

- `+60138155761` ✓
- `0138155761` ✓
- `60138155761` ✓
- `138155761` ✓

## Quick smoke test (for FE colleague to verify wiring)

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

Expect `200` with `auth.token` set. Use that token in `Authorization: Bearer <token>` for everything else.

## Important

- **Replace every `// TODO: POST /...` in `app/lib/api.ts`** with real fetches using `getAuthHeaders()`.
- **Drop `onboarding-storage.ts`** — JWT in localStorage is the source of truth now.
- **Remove the seeded `_savedBudget` / mock arrays** — let real API drive state.
- **Loading + error states** must show real network failures (Cloudflare can occasionally 502 on cold origin) — show "Trying again..." with a retry.

That's everything FE needs. One `POST /families` and the judge is in.
