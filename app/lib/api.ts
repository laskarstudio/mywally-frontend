/**
 * API layer — all functions call the real backend.
 * Base URL: https://wally-api.mywally-app.com
 * Auth: Bearer token stored in localStorage (demo only).
 */

import { apiFetch, ApiError } from './client'
import {
  AuthResponseSchema,
  DashboardSchema,
  ApiBudgetSchema,
  MemberDetailSchema,
  TransactionResponseSchema,
} from './types'
import type { Family } from './types'
import { setOnboardingState, getOnboardingState } from './onboarding-storage'

// ─── Internal app types (used by hooks and UI) ────────────────────────────────

export type AccountSummary = {
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
  threshold: number             // warningThresholdPercent
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

export type ConsentPayload = {
  elderlyMode: boolean
  familyShare: boolean
}

export type FamilyMemberPayload = {
  phone:        string
  relationship: string
}

export type CreateFamilyPayload = {
  parentName:        string
  guardianName:      string
  guardianPhone:     string
  relationshipLabel: string
}

export type CreateFamilyResult = {
  familyId: string
  guardian: { id: string; fullName: string; phone: string; relationshipLabel: string }
}

// ─── Query keys ───────────────────────────────────────────────────────────────

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function fetchFamilies(): Promise<Family[]> {
  const raw = await apiFetch<unknown[]>('/families', { auth: false })
  return raw as Family[]
}

export async function loginAsFamily(userId: string) {
  const raw = await apiFetch<unknown>('/auth/tokens', {
    auth:   false,
    method: 'POST',
    body:   JSON.stringify({ userId }),
  })
  return AuthResponseSchema.parse(raw)
}

// ─── Dashboard / Account ──────────────────────────────────────────────────────

export async function fetchAccountSummary(): Promise<AccountSummary> {
  const raw = await apiFetch<unknown>('/me/dashboard')
  const d   = DashboardSchema.parse(raw)

  // Spending data not exposed via REST — shown in Wally chat instead.
  // Use the balance from the BFF; spending values default to 0.
  return {
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
  try {
    const raw = await apiFetch<unknown>('/me/budget')
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
  const body = {
    amount:                  { value: payload.amount, currency: 'MYR' },
    period:                  PERIOD_REVERSE[payload.period],
    warningThresholdPercent: payload.threshold,
  }
  await apiFetch('/me/budget', { method: 'PUT', body: JSON.stringify(body) })
  return payload
}

// ─── Send money / Transactions ────────────────────────────────────────────────

export async function initiateTransfer(payload: TransferPayload): Promise<TransferResult> {
  // 1. Submit for risk evaluation
  const txnRaw = await apiFetch<unknown>('/transactions', {
    auth:   false,
    method: 'POST',
    body:   JSON.stringify({
      externalRef:          `demo-${Date.now()}`,
      familyId:             localStorage.getItem('mywally_familyId') ?? 'unknown',
      amount:               parseFloat(payload.amount),
      currency:             'MYR',
      recipientHandle:      payload.recipient,
      recipientName:        payload.recipient,
      isFirstTimeRecipient: false,
    }),
  })
  const txn = TransactionResponseSchema.parse(txnRaw)

  // 2. Poll until terminal state (max 30 s)
  const terminalStates = new Set(['RELEASED', 'DENIED', 'BLOCKED', 'REJECTED', 'CANCELLED'])
  const start = Date.now()
  let current = txn

  while (!terminalStates.has(current.state) && Date.now() - start < 28_000) {
    await new Promise(r => setTimeout(r, 2000))
    const polled = await apiFetch<unknown>(`/transactions/${current.transactionId}`, { auth: false })
    current = TransactionResponseSchema.parse(polled)
  }

  const approved = current.state === 'RELEASED'
  return { status: approved ? 'approved' : 'declined', transactionId: current.transactionId }
}

// ─── Family creation (onboarding Case A — parent has no family yet) ──────────

export async function createFamily(payload: CreateFamilyPayload): Promise<CreateFamilyResult> {
  const result = await apiFetch<CreateFamilyResult>('/families', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
  if (typeof window !== 'undefined') {
    localStorage.setItem('mywally_familyId', result.familyId)
  }
  return result
}

// ─── Onboarding (still localStorage-backed; no API endpoint for consent) ──────

export async function saveConsent(payload: ConsentPayload): Promise<void> {
  setOnboardingState({ consent: { elderlyMode: payload.elderlyMode, familyShare: payload.familyShare } })
}

export async function addFamilyMember(payload: FamilyMemberPayload): Promise<void> {
  const state = getOnboardingState()
  setOnboardingState({ familyMembers: [...state.familyMembers, payload] })
}

export async function completeOnboarding(): Promise<void> {
  setOnboardingState({ complete: true })
}
