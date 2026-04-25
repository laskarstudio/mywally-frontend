'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

const OPTIONS = [
  {
    icon: '📱',
    title: 'To Mobile Number',
    subtitle: 'Send to any mobile number',
    href: '/send-money/mobile',
  },
  {
    icon: '👜',
    title: 'To TnG eWallet',
    subtitle: 'Send to TnG eWallet users',
    href: '/send-money/ewallet',
  },
  {
    icon: '🏦',
    title: 'To Bank Account',
    subtitle: 'Send to any bank account',
    href: '/send-money/bank',
  },
]

export default function SendMoneyPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-1">

      {/* Orange header */}
      <div className="bg-accent flex-shrink-0 relative overflow-hidden">
        <StatusBar variant="light" />
        <div className="flex items-end justify-between px-5 pb-6 mt-2">
          <h1 className="text-white font-bold text-4xl leading-tight">
            Send<br />Money
          </h1>
          <Image
            src="/assets/my-wally-money.png"
            alt="Wally with money"
            width={110}
            height={110}
            className="object-contain"
          />
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface px-4 py-5 space-y-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.title}
            onClick={() => router.push(opt.href)}
            className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm active:bg-surface transition-colors text-left"
          >
            <span className="text-3xl">{opt.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">{opt.title}</p>
              <p className="text-muted text-sm">{opt.subtitle}</p>
            </div>
            <ChevronIcon />
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
