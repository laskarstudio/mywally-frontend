/**
 * API layer — all functions are stubs returning mock data.
 * To wire up a real backend: replace each function body with a fetch() call
 * and remove the delay() helper. Types stay the same.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountSummary = {
  balance: string
  dailyBudget: number
  spentToday: number
  remaining: number
  progressPct: number
}

export type Transaction = {
  id: string
  label: string
  amount: number
}

export type Member = {
  id: string
  name: string
  relationship: string
}

export type MemberDetail = Member & {
  permissions: string[]
  connected: boolean
}

export type Budget = {
  amount: string
  period: 'Daily' | 'Weekly' | 'Monthly'
  threshold: number
}

export type WallyMessage = {
  id: string
  text: string
  card?: 'progress'
}

export type WallyResponseData = {
  messages: WallyMessage[]
}

export type TransferPayload = {
  method: string
  amount: string
  recipient: string
}

export type TransferResult = {
  status: 'approved' | 'declined'
  transactionId: string
}

export type ConsentPayload = {
  elderlyMode: boolean
  familyShare: boolean
}

export type FamilyMemberPayload = {
  phone: string
  relationship: string
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  accountSummary: () => ['account', 'summary'] as const,
  transactions:   () => ['account', 'transactions'] as const,
  members:        () => ['members'] as const,
  member:   (id: string) => ['members', id] as const,
  budget:         () => ['budget'] as const,
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

// ─── Account ──────────────────────────────────────────────────────────────────

export async function fetchAccountSummary(): Promise<AccountSummary> {
  await delay(300)
  const dailyBudget = 100
  const spentToday  = 45
  return {
    balance:     '1,568.97',
    dailyBudget,
    spentToday,
    remaining:   dailyBudget - spentToday,
    progressPct: Math.round((spentToday / dailyBudget) * 100),
  }
}

export async function fetchRecentTransactions(): Promise<Transaction[]> {
  await delay(300)
  return [
    { id: '1', label: 'Grab Food',    amount: 15 },
    { id: '2', label: 'Petrol',       amount: 12 },
    { id: '3', label: 'Supermarket',  amount: 18 },
  ]
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function fetchMembers(): Promise<Member[]> {
  await delay(300)
  return [
    { id: 'radhiah', name: 'Nur Radhiah',    relationship: 'Daughter' },
    { id: 'amirul',  name: 'Amirul Ruzaimi', relationship: 'Son' },
  ]
}

export async function fetchMember(id: string): Promise<MemberDetail> {
  await delay(300)
  const members: Record<string, MemberDetail> = {
    radhiah: {
      id: 'radhiah', name: 'Nur Radhiah', relationship: 'Daughter',
      connected: true,
      permissions: ['View balance', 'View transaction history', 'Receive alerts'],
    },
    amirul: {
      id: 'amirul', name: 'Amirul Ruzaimi', relationship: 'Son',
      connected: true,
      permissions: ['View balance', 'View transaction history', 'Receive alerts'],
    },
  }
  const member = members[id]
  if (!member) throw new Error(`Member not found: ${id}`)
  return member
}

export async function removeMember(id: string): Promise<void> {
  void id
  await delay(500)
}

// ─── Budget ───────────────────────────────────────────────────────────────────

let _savedBudget: Budget | null = null

export async function fetchBudget(): Promise<Budget | null> {
  await delay(300)
  return _savedBudget
}

export async function saveBudget(payload: Budget): Promise<Budget> {
  await delay(500)
  _savedBudget = payload
  return _savedBudget
}

// ─── Wally ────────────────────────────────────────────────────────────────────

const WALLY_SCRIPTS: Record<string, WallyMessage[]> = {
  spending: [
    { id: '1', text: 'You have spent RM45.00 today. You still have RM55.00 left of your daily budget.' },
    { id: '2', text: '', card: 'progress' },
    { id: '3', text: 'Great job! You are staying within your budget.' },
  ],
  budget: [
    { id: '1', text: 'Your daily budget is RM100.00. You have spent RM45.00 and have RM55.00 remaining.' },
    { id: '2', text: '', card: 'progress' },
  ],
  scams: [
    { id: '1', text: 'Stay safe! Never share your PIN or OTP with anyone, even if they claim to be from the bank.' },
    { id: '2', text: 'If someone asks for your password or OTP, hang up immediately and call your bank.' },
  ],
  transactions: [
    { id: '1', text: 'Here are your recent transactions today:' },
    { id: '2', text: '• RM15.00 — Grab Food\n• RM12.00 — Petrol\n• RM18.00 — Supermarket' },
    { id: '3', text: 'Total spent: RM45.00 of your RM100.00 daily budget.' },
  ],
}

export async function fetchWallyResponse(key: string): Promise<WallyResponseData> {
  await delay(600)
  // TODO: POST /wally/query  { key, userId }
  const messages = WALLY_SCRIPTS[key] ?? [{ id: '1', text: "I'm working on that for you!" }]
  return { messages }
}

// ─── Send money ───────────────────────────────────────────────────────────────

export async function initiateTransfer(payload: TransferPayload): Promise<TransferResult> {
  await delay(2500)
  // TODO: POST /transfers  { method, amount, recipient }
  let status: 'approved' | 'declined'
  if (payload.method === 'mobile')  status = 'approved'
  else if (payload.method === 'ewallet') status = 'declined'
  else status = Math.random() < 0.5 ? 'approved' : 'declined'
  return { status, transactionId: `TXN-${Date.now()}` }
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

import { setOnboardingState, getOnboardingState } from './onboarding-storage'

export async function saveConsent(payload: ConsentPayload): Promise<void> {
  // TODO: POST /onboarding/consent
  setOnboardingState({ consent: { elderlyMode: payload.elderlyMode, familyShare: payload.familyShare } })
}

export async function addFamilyMember(payload: FamilyMemberPayload): Promise<void> {
  // TODO: POST /onboarding/family-members
  const state = getOnboardingState()
  setOnboardingState({ familyMembers: [...state.familyMembers, payload] })
}

export async function completeOnboarding(): Promise<void> {
  // TODO: POST /onboarding/complete
  setOnboardingState({ complete: true })
}
