You are integrating the myWally chatbot API into a Next.js 15+ App Router app (TypeScript, server components where possible).

# API base URL

https://wally-api.mywally-app.com

# Auth (hackathon dev-mode)

POST /auth/tokens
Body: { "userId": "<uuid>" }
Returns: { "token": "<jwt>", "tokenType": "Bearer", "user": { "id", "role", "fullName", "phone" } }

The token is a JWT. Use it as: Authorization: Bearer <token>
Roles: PARENT | GUARDIAN. Tools the chatbot exposes are filtered by role + per-guardianship permissions.

# Endpoints to integrate

GET /me Bearer user profile
GET /me/dashboard Bearer BFF for the home screen (greeting, balance, members[])
GET /me/budget Bearer family budget (amount, period, warningThresholdPercent)
PUT /me/budget Bearer update budget (parent only)
GET /me/members/:guardianshipId Bearer BFF for the member-detail screen
GET /me/chat/tools Bearer list tools the LLM can call for this user
POST /me/chat/messages Bearer SEND A CHATBOT MESSAGE
GET /families public list of demo families (use to pick a userId for /auth/tokens)
GET /families/:id public single family
PATCH /guardianships/:id Bearer update a member (relationshipLabel, permissions)
DELETE /guardianships/:id Bearer revoke a member (soft delete)
POST /transactions public submit a payment for risk evaluation (TNG-shaped)
GET /transactions/:id public poll transaction state

# Chat message contract (the heart of the integration)

POST /me/chat/messages
Headers: Authorization: Bearer <token>
Body:
{
"text": "Add my daughter Aishah, +60123456789",
"history": [
{ "role": "user", "content": "previous message" },
{ "role": "assistant", "content": "previous reply" }
]
}

Response (always 200 unless auth fails):
{
"reply": { "role": "assistant", "text": "Got it. I've added Aishah." },
"actions": [
{
"type": "ADD_FAMILY_MEMBER",
"tool": "add_family_member",
"status": "success" | "error" | "denied",
"data": { /* tool-specific payload */ },
"error": "..." // only if status != success
}
],
"ui": [
{ "kind": "toast", "level": "success", "message": "Added Aishah as Daughter" },
{ "kind": "refresh", "resource": "/me/dashboard" },
{ "kind": "navigate", "to": "/somewhere" }
],
"llm": { "provider": "bedrock" | "alibaba" | "anthropic" | "moonshot", "configured": true }
}

The server is STATELESS for chat. The frontend keeps history and sends the last ~20 messages on each request.

The chat uses an **agentic multi-turn loop** server-side: when the user message triggers a tool, the backend executes the tool, sends the result back to the LLM, and the LLM produces a final narrated reply. This means a single POST may take 2-6 seconds depending on provider/model. Show a typing indicator. Don't time out under 30s.

LLM provider is configurable server-side (one of: bedrock, alibaba, anthropic, moonshot). The frontend doesn't care which one is active — same response shape across all four. Read response.llm.provider if you want to display "Powered by ..." somewhere.

# What to build

1. /lib/api.ts - typed fetch wrapper that injects Bearer header and parses errors.
2. /lib/types.ts - TypeScript types for ChatResponse, ChatAction, UiHint, MeDashboard, Budget, Member.
3. /hooks/useChat.ts - React hook that manages history, optimistically appends user message, calls /me/chat/messages, appends assistant reply + handles ui hints.
4. /components/Chatbot.tsx - presentational component:
   - Message list (user right, assistant left)
   - For each assistant message, if it has actions render an inline card showing tool name + status + key fields from data
   - Composer with input + send button
   - Disable send while in flight
5. UI hint handling (in the hook):
   - kind=toast → call sonner.toast[level || 'info'](message)
   - kind=refresh → queryClient.invalidateQueries({ queryKey: [resource] })
   - kind=navigate → router.push(to)
6. Auth: store the token in a httpOnly cookie via a /api/auth/login route handler that proxies to POST /auth/tokens. Don't store JWT in localStorage in production.

# Stack assumptions

- Next.js 15+ App Router, TypeScript strict
- TanStack Query v5 for fetch state
- shadcn/ui (button, input, card, scroll-area)
- sonner for toasts
- zod for response validation

# Edge cases to handle

- llm.configured === false → show "Chatbot offline, please contact admin" banner. The reply.text in this case explains which tools the user could otherwise use, so you can render it as a text bubble unchanged.
- actions with status='denied' → render with red treatment, message "You don't have permission for this"
- actions with status='error' → show error message from action.error
- 401 from any endpoint → redirect to login (token expired)
- Assistant text contains real
  newlines for lists. Render with whitespace-pre-wrap (Tailwind) on the bubble container so line breaks display correctly.

# Rich card rendering

Some tools return structured data the FE should render as rich cards INSIDE the chat thread, not just as raw JSON.
Pattern: read action.tool, switch on tool name, render a custom component using action.data.

Tools currently shipped (read GET /me/chat/tools to see what your role is allowed):

- get_spending_summary → render a "Today's Progress" card (or weekly/monthly based on data.period). Show: spent, budget, remaining, a progress bar at percentUsed (color shifts at warningThresholdPercent), and the period label.
- list_family_members → render a list of avatar rows with name + relationshipLabel, tap-through to /members/:guardianshipId.
- add_family_member → render a confirmation card with the new member's name, phone, and "View" CTA linking to their detail page.
- set_budget → render a small "Budget updated" card showing the new amount + period.
- get_balance → render a balance pill or hero card.

Server returns BOTH a narrated text reply AND the structured action. The FE composition is typically:

1. Assistant text bubble
2. Inline rich card from action.data
3. (Optional) The next assistant text bubble if the LLM continues with a follow-up

Render order: text bubble first, then for each action in actions[], render the card matching action.tool. If unknown tool, fall back to a generic "Tool ran: <name>" pill.

# Style

The mobile screens are warm/orange/purple, friendly elderly-first design. Big tap targets, generous whitespace, large readable type. Keep the chatbot bubble UI simple and accessible.

Generate the files now. Include any UI utilities you need. Use server-side data fetching where it makes sense (initial dashboard load) and client components for the chat itself.
