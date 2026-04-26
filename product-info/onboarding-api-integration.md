Deployed. Now here's the **FE integration prompt** for that onboarding screen — give this to your colleague:

---

# FE Prompt — myWally onboarding chatbot screen

You are integrating the chatbot-style onboarding flow with the myWally backend. The screen collects: **family member's full name, phone, relationship, consent**, and creates a family with one guardian linked.

## API base

`https://wally-api.mywally-app.com`

## Auth

The user (the parent) is **already signed in** with a JWT before reaching this screen. Send it as `Authorization: Bearer <token>`. If you don't have JWT yet for testing, mint one via `POST /auth/tokens` with `{ "userId": "<parent-user-id>" }` from `/sim`.

## Flow → API mapping

| Bot question                           | FE collects                  | Validation                                                 |
| -------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| "What is their name?"                  | `fullName` (string)          | Non-empty, trim                                            |
| "What is their phone number?"          | `phone` (string)             | Accept `0138155761` OR `+60138155761` — backend normalizes |
| "What is your relationship with them?" | `relationshipLabel` (string) | One of: Children, Spouse, Sibling, Parent, Other           |
| "Do you consent to share your data?"   | `consent` (boolean)          | Must be `true` to proceed                                  |

## When user clicks "I agree"

Two cases:

### Case A — Parent has no family yet (first onboarding)

Use `POST /families` to bootstrap parent + first guardian in one call.

```ts
const res = await fetch("https://wally-api.mywally-app.com/families", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  },
  body: JSON.stringify({
    parentName: parent.fullName, // already known from signed-in user
    guardianName: input.fullName, // from chatbot
    guardianPhone: input.phone, // 0138... or +60... both fine
    relationshipLabel: input.relationshipLabel,
    parentPhone: parent.phone, // optional
  }),
});

if (!res.ok) {
  const err = await res.json();
  // err.message tells the user what's wrong (e.g. "Invalid guardianPhone")
  showError(err.message);
  return;
}

const { familyId, guardian } = await res.json();
```

### Case B — Parent already has a family, adding more guardians

Use the **chatbot tool endpoint** which goes through the same agentic flow as the in-app chatbot:

```ts
await fetch("https://wally-api.mywally-app.com/me/chat/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  },
  body: JSON.stringify({
    text: `Add ${input.fullName}, phone ${input.phone}, relationship ${input.relationshipLabel}`,
    history: [],
  }),
});
```

The backend's `add_family_member` tool runs server-side. Response includes `actions[]` with the tool result.

## Phone format

Backend accepts and normalizes any of these:

- `+60138155761` ✓
- `0138155761` → becomes `+60138155761`
- `60138155761` → becomes `+60138155761`
- `138155761` → becomes `+60138155761`

If invalid, the API returns 400 with a helpful message — surface it directly to the user.

## Error states FE must handle

| Scenario                                   | Status                                                           | What to show                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Invalid phone                              | 400                                                              | Re-prompt: "That phone number doesn't look right. Try `01XXXXXXXX` or `+60...`" |
| Phone already linked to a different family | (backend reuses the user, links via Guardianship — not an error) | —                                                                               |
| User declines consent                      | (FE-only, never call API)                                        | Take user back to home, show "Maybe later"                                      |
| Network error                              | —                                                                | "Couldn't reach myWally. Retry?"                                                |
| 401 (JWT expired)                          | 401                                                              | Trigger re-login                                                                |

## Consent

The FE captures consent as a checkbox/button click. **It is not yet persisted to the API** — for now, just block the API call until consent is `true`. (Roadmap: backend will store consent on the `Guardianship` record. We'll add `POST /guardianships/:id/consent` later.)

## Quick test

```bash
curl -X POST https://wally-api.mywally-app.com/families \
  -H "Content-Type: application/json" \
  -d '{
    "parentName": "Encik Rahmat",
    "guardianName": "Nur Radhiah",
    "guardianPhone": "0138155761",
    "relationshipLabel": "Daughter"
  }'
```

Expect `200` with a `familyId` and the normalized guardian phone (`+60138155761`).

---

That's it. Send this whole block to FE.
