import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const AuthResponseSchema = z.object({
  token:     z.string(),
  tokenType: z.string(),
  user:      z.object({
    id:       z.string(),
    role:     z.enum(['PARENT', 'GUARDIAN']),
    fullName: z.string(),
    phone:    z.string(),
  }),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

// ─── Families ─────────────────────────────────────────────────────────────────

export const FamilySchema = z.object({
  familyId: z.string(),
  balance:  z.string().optional(),
  parent: z.object({
    id:       z.string(),
    fullName: z.string(),
    phone:    z.string(),
  }),
  guardian: z.object({
    id:                z.string(),
    fullName:          z.string(),
    relationshipLabel: z.string().optional(),
  }).optional(),
})
export type Family = z.infer<typeof FamilySchema>

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const DashboardMemberSchema = z.object({
  guardianshipId:    z.string(),
  userId:            z.string(),
  fullName:          z.string(),
  phone:             z.string(),
  avatarUrl:         z.string().nullable().optional(),
  relationshipLabel: z.string(),
})

export const DashboardSchema = z.object({
  role:     z.string(),
  greeting: z.string(),
  balance:  z.object({ amount: z.string(), currency: z.string() }),
  familyId: z.string(),
  members:  z.array(DashboardMemberSchema),
})
export type Dashboard = z.infer<typeof DashboardSchema>

// ─── Budget ───────────────────────────────────────────────────────────────────

export const ApiBudgetSchema = z.object({
  familyId:                z.string(),
  amount:                  z.object({ value: z.string(), currency: z.string() }),
  period:                  z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  warningThresholdPercent: z.number(),
})
export type ApiBudget = z.infer<typeof ApiBudgetSchema>

// ─── Member detail ────────────────────────────────────────────────────────────

export const MemberDetailSchema = z.object({
  guardianshipId:    z.string(),
  familyId:          z.string(),
  status:            z.string(),
  statusLabel:       z.string(),
  relationshipLabel: z.string(),
  sunsetAt:          z.string().nullable(),
  permissions: z.object({
    viewBalance:      z.boolean(),
    viewTransactions: z.boolean(),
    receiveAlerts:    z.boolean(),
  }),
  guardian: z.object({
    userId:    z.string(),
    fullName:  z.string(),
    phone:     z.string(),
    avatarUrl: z.string().nullable().optional(),
  }),
  parent: z.object({
    userId:   z.string(),
    fullName: z.string(),
  }),
})
export type ApiMemberDetail = z.infer<typeof MemberDetailSchema>

// ─── Transaction ──────────────────────────────────────────────────────────────

export const TransactionResponseSchema = z.object({
  transactionId: z.string(),
  externalRef:   z.string().optional(),
  state:         z.string(),
  riskScore:     z.number().optional(),
  riskReasons:   z.array(z.string()).optional(),
  decidedAt:     z.string().nullable().optional(),
  decisionReason: z.string().nullable().optional(),
  latestDecision: z.unknown().optional(),
})
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const UiHintSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('toast'),    level: z.string().optional(), message: z.string() }),
  z.object({ kind: z.literal('refresh'),  resource: z.string() }),
  z.object({ kind: z.literal('navigate'), to: z.string() }),
])
export type UiHint = z.infer<typeof UiHintSchema>

export const ChatActionSchema = z.object({
  type:   z.string(),
  tool:   z.string(),
  status: z.enum(['success', 'error', 'denied']),
  data:   z.record(z.string(), z.unknown()).optional(),
  error:  z.string().optional(),
})
export type ChatAction = z.infer<typeof ChatActionSchema>

export const ChatResponseSchema = z.object({
  reply:   z.object({ role: z.literal('assistant'), text: z.string() }),
  actions: z.array(ChatActionSchema).optional().default([]),
  ui:      z.array(UiHintSchema).optional().default([]),
  llm:     z.object({
    provider:   z.string(),
    configured: z.boolean(),
  }).optional(),
})
export type ChatResponse = z.infer<typeof ChatResponseSchema>
