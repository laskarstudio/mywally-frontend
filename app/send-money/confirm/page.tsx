'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#EC7C3C" />
      <path d="M12 7v5M12 16v.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const method = searchParams.get('method') ?? 'bank'

  return (
    <div className="flex flex-col flex-1 bg-white">

      <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-8">

        <h1 className="text-foreground font-bold text-3xl leading-tight text-center mb-8">
          Confirm<br />Transaction
        </h1>

        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-muted text-base mb-1">You are sending</p>
          <p className="text-primary font-bold text-4xl">RM500.00</p>
          <p className="text-foreground font-medium text-base mt-1">to Ahmad Ali</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-10">
          <div className="flex items-center gap-2 mb-1">
            <WarningIcon />
            <p className="text-accent font-bold text-sm">This is a new payee</p>
          </div>
          <p className="text-foreground text-sm leading-relaxed">
            You haven&apos;t sent money to Ahmad Ali before
          </p>
        </div>

        <button
          onClick={() => router.push(`/send-money/processing?method=${method}`)}
          className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:opacity-80 transition-opacity mb-3"
        >
          Confirm
        </button>
        <button
          onClick={() => router.back()}
          className="w-full h-[52px] rounded-2xl border-2 border-primary text-primary font-bold text-base active:bg-surface transition-colors"
        >
          Cancel
        </button>

      </div>
    </div>
  )
}

export default function ConfirmTransactionPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
