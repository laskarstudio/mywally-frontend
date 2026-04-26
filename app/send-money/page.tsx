'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import BottomNav from '@/app/components/bottom-nav'

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC7C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC7C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5z" />
      <path d="M16 12a1 1 0 100 2 1 1 0 000-2z" fill="#EC7C3C" />
    </svg>
  )
}

function BankIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC7C3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22h18M3 10h18M12 2L3 7h18L12 2zM5 10v8M19 10v8M9 10v8M15 10v8" />
    </svg>
  )
}

const OPTIONS = [
  {
    Icon: MobileIcon,
    title: 'To Mobile Number',
    subtitle: 'Send to any mobile number',
    method: 'mobile',
  },
  {
    Icon: WalletIcon,
    title: 'To TnG eWallet',
    subtitle: 'Send to TnG eWallet users',
    method: 'ewallet',
  },
  {
    Icon: BankIcon,
    title: 'To Bank Account',
    subtitle: 'Send to any bank account',
    method: 'bank',
  },
]

export default function SendMoneyPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-1">

      {/* Orange header */}
      <div className="bg-accent flex-shrink-0 relative overflow-hidden">
        <div className="flex items-end justify-between px-5 pb-6 mt-2">
          <h1 className="text-white font-bold text-4xl leading-tight">
            Send<br />Money
          </h1>
          <Image
            src="/assets/my-wally-paper-plane.png"
            alt="Wally sending money"
            width={110}
            height={110}
            className="object-contain"
          />
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface px-4 py-5 space-y-3">
        {OPTIONS.map(({ Icon, title, subtitle, method }) => (
          <button
            key={title}
            onClick={() => router.push(`/send-money/confirm?method=${method}`)}
            className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm active:bg-surface transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Icon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{title}</p>
              <p className="text-muted text-sm">{subtitle}</p>
            </div>
            <ChevronIcon />
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
