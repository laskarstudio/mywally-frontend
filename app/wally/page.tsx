'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'
import { useWallyQuery } from '@/app/lib/hooks/useWally'
import { useAccountSummary } from '@/app/lib/hooks/useAccount'

type WallyView = 'home' | 'chat'

/* ── Icons ──────────────────────────────────────────────── */
function SpendIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function ReceiptIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}
function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
    </svg>
  )
}

const QUICK_ACTIONS = [
  { key: 'budget',       label: 'How much can I spend today?', Icon: SpendIcon,   bg: 'bg-blue-50' },
  { key: 'spending',     label: 'Show my spending',            Icon: ChartIcon,   bg: 'bg-green-50' },
  { key: 'scams',        label: 'Check for scams',             Icon: ShieldIcon,  bg: 'bg-orange-50' },
  { key: 'transactions', label: 'Show recent transactions',    Icon: ReceiptIcon, bg: 'bg-purple-50' },
]

function WallyAvatar() {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface">
      <Image src="/assets/my-wally-chat-profile.png" alt="Wally" width={40} height={40} />
    </div>
  )
}

function ProgressCard({ spentToday, dailyBudget }: { spentToday: number; dailyBudget: number }) {
  const pct = Math.round((spentToday / dailyBudget) * 100)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
      <p className="text-accent font-bold text-sm mb-3">Today&apos;s Progress</p>
      <div className="flex justify-between text-sm text-foreground font-medium mb-2">
        <span>RM{spentToday} spent</span>
        <span>RM{dailyBudget} budget</span>
      </div>
      <div className="h-3 rounded-full bg-surface overflow-hidden">
        <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function BotText({ text }: { text: string }) {
  const parts = text.split(/(RM\d+(?:\.\d{2})?)/g)
  return (
    <p className="text-sm text-foreground leading-relaxed font-medium whitespace-pre-line">
      {parts.map((part, i) =>
        /^RM\d/.test(part)
          ? <span key={i} className="text-primary font-bold">{part}</span>
          : part
      )}
    </p>
  )
}

export default function WallyPage() {
  const [view, setView]           = useState<WallyView>('home')
  const [userQuery, setUserQuery] = useState('')
  const [textInput, setTextInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { mutate: askWally, data: wallyData, isPending: isLoading } = useWallyQuery()
  const { data: account } = useAccountSummary()

  const messages = useMemo(() => wallyData?.messages ?? [], [wallyData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleQuickAction(key: string, label: string) {
    setUserQuery(label)
    setView('chat')
    askWally(key)
  }

  /* ── Chat view ── */
  if (view === 'chat') {
    return (
      <div className="flex flex-col flex-1 bg-surface">

        <div className="flex-shrink-0 bg-surface">
          <StatusBar variant="dark" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4 space-y-4">

          {/* User query bubble */}
          <div className="flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%]">
              <p className="text-white text-sm font-medium">{userQuery}</p>
            </div>
          </div>

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex items-start gap-2.5">
              <WallyAvatar />
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-muted animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Bot responses */}
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.card === 'progress' ? (
                <div className="pl-12">
                  <ProgressCard
                    spentToday={account?.spentToday ?? 45}
                    dailyBudget={account?.dailyBudget ?? 100}
                  />
                </div>
              ) : msg.text ? (
                <div className="flex items-start gap-2.5">
                  <WallyAvatar />
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[80%]">
                    <BotText text={msg.text} />
                  </div>
                </div>
              ) : null}
            </div>
          ))}

          {messages.length > 0 && (
            <div className="flex justify-end">
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="bg-white border-t border-border px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3 bg-surface rounded-full px-4 py-3">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted"
            />
            <MicIcon />
          </div>
        </div>

        <BottomNav />
      </div>
    )
  }

  /* ── Home view ── */
  return (
    <div className="flex flex-col flex-1 bg-surface">

      <div className="bg-primary rounded-b-[40px] text-white text-center px-6 pb-10 flex-shrink-0">
        <StatusBar variant="light" />
        <p className="text-base mt-3 text-white/80">Hi, I&apos;m Wally.</p>
        <h1 className="text-3xl font-bold leading-snug mt-1">
          How Can I Help<br />You Today?
        </h1>
      </div>

      <div className="flex-shrink-0 flex justify-center -mt-14 mb-4 relative z-10">
        <Image
          src="/assets/my-wally-chat-profile.png"
          alt="Wally"
          width={140}
          height={140}
          className="object-contain drop-shadow-xl"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {QUICK_ACTIONS.map(({ key, label, Icon, bg }) => (
            <button
              key={key}
              onClick={() => handleQuickAction(key, label)}
              className={`${bg} rounded-2xl p-4 text-left flex flex-col gap-3 active:opacity-80 transition-opacity min-h-[100px]`}
            >
              <Icon />
              <span className="text-foreground font-semibold text-sm leading-snug">{label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-full px-4 py-3 shadow-sm flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted"
          />
          <MicIcon />
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
