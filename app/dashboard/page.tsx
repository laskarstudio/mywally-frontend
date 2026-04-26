'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'
import { useAccountSummary } from '@/app/lib/hooks/useAccount'
import { useMembers } from '@/app/lib/hooks/useMembers'
import { useBudget } from '@/app/lib/hooks/useBudget'
import { clearAuth } from '@/app/lib/auth'

/* ── Icons ──────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
function RequestIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  )
}
function BillsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}
function SpendingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function PersonIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { data: account } = useAccountSummary()
  const { data: members } = useMembers()
  const { data: budget } = useBudget()

  function handleStartOver() {
    clearAuth()
    router.replace('/onboarding/consent')
  }

  return (
    <div className="flex flex-col flex-1 bg-surface">

      {/* Orange Header */}
      <div className="bg-accent flex-shrink-0">
        <StatusBar variant="light" />
        <div className="flex items-center justify-between px-5 pb-5 mt-1">
          <div>
            <p className="text-white/80 text-sm">Good morning,</p>
            <p className="text-white font-bold text-2xl">{account?.greeting ?? '—'}</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <BellIcon />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">

        {/* Balance card */}
        <div className="bg-primary rounded-2xl p-5 text-center">
          <p className="text-white/70 text-sm mb-1">Available Balance</p>
          <p className="text-white font-bold text-4xl tracking-tight">
            RM{account?.balance ?? '—'}
          </p>
        </div>

        {/* Budget section — banner if not configured, summary card if configured */}
        {!budget ? (
          <button
            onClick={() => router.push('/budget')}
            className="w-full bg-accent rounded-2xl flex items-center overflow-hidden active:opacity-80 transition-opacity"
          >
            <Image
              src="/assets/my-wally-daily-budget.png"
              alt="Wally"
              width={100}
              height={100}
              className="object-contain flex-shrink-0 self-end"
            />
            <div className="flex-1 px-3 text-left">
              <p className="text-white font-bold text-lg leading-snug">Setup your<br />Daily Budget</p>
            </div>
            <span className="text-white text-xl font-bold pr-4">›</span>
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-accent font-bold text-base mb-4">Today&apos;s Summary</p>

            <p className="text-primary font-bold text-3xl">RM{account?.spentToday ?? '—'}.00</p>
            <p className="text-foreground font-medium text-sm mb-4">Spent today</p>

            <div className="border-t border-border pt-4">
              <p className="text-foreground text-sm mb-1">You have</p>
              <p className="text-primary font-bold text-3xl">RM{account?.remaining ?? '—'}.00</p>
              <p className="text-foreground font-medium text-sm mb-3">daily budget left</p>

              <div className="h-3 rounded-full bg-surface overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${account?.progressPct ?? 0}%` }}
                />
              </div>

              <button
                onClick={() => router.push('/budget')}
                className="w-full h-11 rounded-xl bg-accent text-white font-semibold text-sm flex items-center justify-center gap-1 active:opacity-80 transition-opacity"
              >
                Daily Budget Settings <span className="text-base">›</span>
              </button>
            </div>
          </div>
        )}

        {/* Action grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Send Money',    icon: <SendIcon />,     bg: 'bg-blue-50',   href: '/send-money' },
            { label: 'Request Money', icon: <RequestIcon />,  bg: 'bg-green-50',  href: '/request-money' },
            { label: 'Pay Bills',     icon: <BillsIcon />,    bg: 'bg-purple-50', href: '/pay-bills' },
            { label: 'View Spending', icon: <SpendingIcon />, bg: 'bg-orange-50', href: '/spending' },
          ].map(({ label, icon, bg, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center gap-3 active:bg-surface transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                {icon}
              </div>
              <span className="text-foreground font-medium text-sm text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Members */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="font-bold text-foreground">Members</p>
            <button className="text-primary text-sm font-medium">View All</button>
          </div>
          {(members ?? []).map((member, i, arr) => (
            <button
              key={member.id}
              onClick={() => router.push(`/members/${member.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 active:bg-surface transition-colors text-left ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="w-11 h-11 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                <PersonIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{member.name}</p>
                <p className="text-muted text-xs">{member.relationship}</p>
              </div>
              <ChevronIcon />
            </button>
          ))}
        </div>

        {/* Safety Tip */}
        <div className="bg-orange-50 rounded-2xl p-4 flex gap-3 items-start">
          <ShieldIcon />
          <div>
            <p className="text-accent font-bold text-sm mb-1">Safety Tip</p>
            <p className="text-foreground text-sm leading-relaxed">Never share your PIN or OTP with anyone</p>
          </div>
        </div>

        <button
          onClick={handleStartOver}
          className="w-full text-muted text-xs font-medium py-2 underline underline-offset-2 active:text-foreground"
        >
          Start Over (Reset Demo)
        </button>

      </div>

      <BottomNav />
    </div>
  )
}
