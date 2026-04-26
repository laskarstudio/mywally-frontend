import { useRouter } from 'next/navigation'
import type { ChatAction } from '@/app/lib/types'

/* ── Shared card wrapper ───────────────────────────────────────────────────── */
function Card({ children, denied }: { children: React.ReactNode; denied?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 shadow-sm mt-2 border ${denied ? 'bg-red-50 border-red-200' : 'bg-white border-border'}`}>
      {children}
    </div>
  )
}

/* ── get_spending_summary ──────────────────────────────────────────────────── */
function SpendingSummaryCard({ data }: { data: Record<string, unknown> }) {
  const spent   = String(data.spent   ?? '0.00')
  const budget  = String(data.budget  ?? '0.00')
  const remaining = String(data.remaining ?? '0.00')
  const pct     = Number(data.percentUsed ?? 0)
  const warning = Number(data.warningThresholdPercent ?? 80)
  const period  = String(data.period ?? 'DAILY').replace('LY', 'ly')

  const barColor = pct >= 100 ? 'bg-danger' : pct >= warning ? 'bg-accent' : 'bg-success'

  return (
    <Card>
      <p className="text-accent font-bold text-sm mb-3">{period}&apos;s Progress</p>
      <div className="flex justify-between text-sm text-foreground font-medium mb-2">
        <span>RM{spent} spent</span>
        <span>RM{budget} budget</span>
      </div>
      <div className="h-3 rounded-full bg-surface overflow-hidden mb-3">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className="text-sm text-foreground">
        <span className="font-semibold text-primary">RM{remaining}</span> remaining
      </p>
    </Card>
  )
}

/* ── list_family_members ───────────────────────────────────────────────────── */
function FamilyMembersCard({ data }: { data: Record<string, unknown> }) {
  const router  = useRouter()
  const members = (data.members as Array<{ guardianshipId: string; fullName: string; relationshipLabel?: string }>) ?? []

  return (
    <Card>
      <p className="text-accent font-bold text-sm mb-3">Family Members</p>
      <div className="space-y-2">
        {members.map(m => (
          <button
            key={m.guardianshipId}
            onClick={() => router.push(`/members/${m.guardianshipId}`)}
            className="w-full flex items-center justify-between py-2 text-left active:opacity-70"
          >
            <div>
              <p className="font-semibold text-foreground text-sm">{m.fullName}</p>
              <p className="text-muted text-xs">{m.relationshipLabel ?? '—'}</p>
            </div>
            <span className="text-muted text-base">›</span>
          </button>
        ))}
        {members.length === 0 && (
          <p className="text-muted text-sm text-center py-2">No members yet</p>
        )}
      </div>
    </Card>
  )
}

/* ── add_family_member ─────────────────────────────────────────────────────── */
function AddFamilyMemberCard({ data }: { data: Record<string, unknown> }) {
  const router = useRouter()
  const name   = String(data.fullName ?? data.name ?? 'New member')
  const phone  = String(data.phone ?? '')
  const id     = String(data.guardianshipId ?? '')

  return (
    <Card>
      <p className="text-success font-bold text-sm mb-2">Member Added</p>
      <p className="font-semibold text-foreground">{name}</p>
      {phone && <p className="text-muted text-sm">{phone}</p>}
      {id && (
        <button
          onClick={() => router.push(`/members/${id}`)}
          className="mt-3 text-primary text-sm font-semibold underline underline-offset-2"
        >
          View Profile
        </button>
      )}
    </Card>
  )
}

/* ── set_budget ────────────────────────────────────────────────────────────── */
function SetBudgetCard({ data }: { data: Record<string, unknown> }) {
  const amount = String(data.amount ?? '—')
  const period = String(data.period ?? '—')

  return (
    <Card>
      <p className="text-accent font-bold text-sm mb-1">Budget Updated</p>
      <p className="text-primary font-bold text-2xl">RM{amount}</p>
      <p className="text-muted text-sm">{period.toLowerCase()} budget</p>
    </Card>
  )
}

/* ── get_balance ───────────────────────────────────────────────────────────── */
function BalanceCard({ data }: { data: Record<string, unknown> }) {
  const amount   = String(data.amount ?? data.balance ?? '—')
  const currency = String(data.currency ?? 'MYR')

  return (
    <Card>
      <p className="text-muted text-xs mb-1">Available Balance</p>
      <p className="text-primary font-bold text-3xl">{currency} {amount}</p>
    </Card>
  )
}

/* ── Denied / Error treatment ─────────────────────────────────────────────── */
function DeniedCard({ action }: { action: ChatAction }) {
  return (
    <Card denied>
      <p className="text-danger font-semibold text-sm">
        {action.status === 'denied'
          ? "You don't have permission for this"
          : action.error ?? 'Something went wrong'}
      </p>
    </Card>
  )
}

/* ── Generic fallback ─────────────────────────────────────────────────────── */
function GenericActionCard({ action }: { action: ChatAction }) {
  return (
    <div className="inline-flex items-center gap-2 bg-surface rounded-full px-3 py-1.5 mt-2">
      <span className="w-2 h-2 rounded-full bg-success" />
      <span className="text-xs text-muted font-medium">Tool ran: {action.tool}</span>
    </div>
  )
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function ChatActionCard({ action }: { action: ChatAction }) {
  if (action.status === 'denied' || action.status === 'error') {
    return <DeniedCard action={action} />
  }

  const data = (action.data ?? {}) as Record<string, unknown>

  switch (action.tool) {
    case 'get_spending_summary': return <SpendingSummaryCard data={data} />
    case 'list_family_members':  return <FamilyMembersCard   data={data} />
    case 'add_family_member':    return <AddFamilyMemberCard data={data} />
    case 'set_budget':           return <SetBudgetCard       data={data} />
    case 'get_balance':          return <BalanceCard         data={data} />
    default:                     return <GenericActionCard   action={action} />
  }
}
