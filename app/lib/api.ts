/**
 * API layer — real backend at https://wally-api.mywally-app.com
 * Auth: JWT stored in localStorage under "mywally.jwt" (demo only).
 */

import { apiFetch, ApiError } from './client'
import { DashboardSchema, ApiBudgetSchema, MemberDetailSchema, TransactionResponseSchema } from './types'
import { setAuth, getFamilyId } from './auth'

// ─── Internal app types ────────────────────────────────────────────────────────

export type AccountSummary = {
  greeting:    string
  balance:     string
  dailyBudget: number
  spentToday:  number
  remaining:   number
  progressPct: number
}

export type Member = {
  id:           string  // guardianshipId
  name:         string
  relationship: string
}

export type MemberDetail = {
  id:           string
  name:         string
  relationship: string
  phone:        string
  permissions:  string[]
  connected:    boolean
}

export type Budget = {
  amount:    string
  period:    'Daily' | 'Weekly' | 'Monthly'
  threshold: number
}

export type TransferPayload = {
  method:    string
  amount:    string
  recipient: string
}

export type TransferResult = {
  status:        'approved' | 'declined'
  transactionId: string
}

// ─── Onboarding types ─────────────────────────────────────────────────────────

export type OnboardingPayload = {
  parentName:         string
  guardianName:       string
  guardianPhone:      string
  relationshipLabel?: string
}

export type OnboardingResult = {
  familyId: string
  parent:   { id: string; fullName: string; phone: string }
  guardian: { id: string; fullName: string; phone: string; relationshipLabel: string }
  auth:     { token: string; tokenType: 'Bearer'; userId: string }
}

// Legacy family payload kept for any residual hook references
export type FamilyMemberPayload = { phone: string; relationship: string }
export type ConsentPayload = { elderlyMode: boolean; familyShare: boolean }

// ─── Query keys ───────────────────────────────────────────────────────────────

export type Family = import('./types').Family

export const queryKeys = {
  accountSummary: () => ['account', 'summary']  as const,
  members:        () => ['members']             as const,
  member:   (id: string) => ['members', id]     as const,
  budget:         () => ['budget']              as const,
  families:       () => ['families']            as const,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PERIOD_MAP: Record<string, Budget['period']> = {
  DAILY: 'Daily', WEEKLY: 'Weekly', MONTHLY: 'Monthly',
}
const PERIOD_REVERSE: Record<Budget['period'], string> = {
  Daily: 'DAILY', Weekly: 'WEEKLY', Monthly: 'MONTHLY',
}

// ─── Onboarding — single public call, returns JWT ─────────────────────────────

export async function bootstrapFamily(p: OnboardingPayload): Promise<OnboardingResult> {
  const result = await apiFetch<OnboardingResult>('/families', {
    auth:   false,
    method: 'POST',
    body:   JSON.stringify({
      parentName:        p.parentName,
      guardianName:      p.guardianName,
      guardianPhone:     p.guardianPhone,
      relationshipLabel: p.relationshipLabel,
    }),
  })
  setAuth(result.auth.token, result.auth.userId, result.familyId)
  return result
}

// ─── Auth — families list (used by login page for returning users) ─────────────

export async function fetchFamilies(): Promise<Family[]> {
  const raw = await apiFetch<unknown[]>('/families', { auth: false })
  return raw as Family[]
}

// ─── Dashboard / Account ──────────────────────────────────────────────────────

export async function fetchAccountSummary(): Promise<AccountSummary> {
  const raw = await apiFetch<unknown>('/me/dashboard')
  const d   = DashboardSchema.parse(raw)
  return {
    greeting:    d.greeting,
    balance:     d.balance.amount,
    dailyBudget: 0,
    spentToday:  0,
    remaining:   0,
    progressPct: 0,
  }
}

export async function fetchMembers(): Promise<Member[]> {
  const raw = await apiFetch<unknown>('/me/dashboard')
  const d   = DashboardSchema.parse(raw)
  return d.members.map(m => ({
    id:           m.guardianshipId,
    name:         m.fullName,
    relationship: m.relationshipLabel,
  }))
}

// ─── Member detail ────────────────────────────────────────────────────────────

export async function fetchMember(guardianshipId: string): Promise<MemberDetail> {
  const raw = await apiFetch<unknown>(`/me/members/${guardianshipId}`)
  const m   = MemberDetailSchema.parse(raw)

  const permissions: string[] = []
  if (m.permissions.viewBalance)      permissions.push('View balance')
  if (m.permissions.viewTransactions) permissions.push('View transaction history')
  if (m.permissions.receiveAlerts)    permissions.push('Receive alerts')

  return {
    id:           m.guardianshipId,
    name:         m.guardian.fullName,
    relationship: m.relationshipLabel,
    phone:        m.guardian.phone,
    permissions,
    connected:    m.status === 'ACTIVE',
  }
}

export async function removeMember(guardianshipId: string): Promise<void> {
  await apiFetch(`/guardianships/${guardianshipId}`, { method: 'DELETE' })
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export async function fetchBudget(): Promise<Budget | null> {
  const familyId = getFamilyId()
  if (!familyId) return null
  try {
    const raw = await apiFetch<unknown>(`/families/${familyId}/budget`)
    const b   = ApiBudgetSchema.parse(raw)
    return {
      amount:    parseFloat(b.amount.value).toFixed(2),
      period:    PERIOD_MAP[b.period] ?? 'Daily',
      threshold: b.warningThresholdPercent,
    }
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export async function saveBudget(payload: Budget): Promise<Budget> {
  const familyId = getFamilyId()
  if (!familyId) throw new Error('Not authenticated')
  await apiFetch(`/families/${familyId}/budget`, {
    method: 'PUT',
    body:   JSON.stringify({
      amount:                  parseFloat(payload.amount),
      period:                  PERIOD_REVERSE[payload.period],
      warningThresholdPercent: payload.threshold,
    }),
  })
  return payload
}

// ─── Send money / Transactions ────────────────────────────────────────────────

export async function initiateTransfer(payload: TransferPayload): Promise<TransferResult> {
  const familyId = getFamilyId() ?? 'unknown'

  const txnRaw = await apiFetch<unknown>('/transactions', {
    auth:   false,
    method: 'POST',
    body:   JSON.stringify({
      externalRef:          `demo-${Date.now()}`,
      familyId,
      amount:               parseFloat(payload.amount),
      currency:             'MYR',
      recipientHandle:      payload.recipient,
      recipientName:        payload.recipient,
      isFirstTimeRecipient: false,
    }),
  })
  const txn = TransactionResponseSchema.parse(txnRaw)

  const terminalStates = new Set(['RELEASED', 'DENIED', 'BLOCKED', 'REJECTED', 'CANCELLED'])
  const start = Date.now()
  let current = txn

  while (!terminalStates.has(current.state) && Date.now() - start < 28_000) {
    await new Promise(r => setTimeout(r, 2000))
    const polled = await apiFetch<unknown>(`/transactions/${current.transactionId}`, { auth: false })
    current = TransactionResponseSchema.parse(polled)
  }

  return {
    status:        current.state === 'RELEASED' ? 'approved' : 'declined',
    transactionId: current.transactionId,
  }
}
