'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ConsentCheckItem from '@/app/components/consent-check-item'

function CheckIcon() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ConsentPage() {
  const router = useRouter()
  const [agreeMode, setAgreeMode] = useState(false)
  const [agreeShare, setAgreeShare] = useState(false)

  return (
    <div className="flex flex-col flex-1 bg-white">

      <div className="bg-accent text-center px-6 pb-24 flex-shrink-0">
        <p className="text-white text-lg mt-2">Welcome to</p>
        <h1 className="text-white font-bold text-[32px] leading-tight">Elderly Mode</h1>
      </div>

      <div className="flex-shrink-0 flex justify-center -mt-16 mb-6 relative z-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-surface relative">
            <Image
              src="/assets/my-wally-welcome-image.png"
              alt="Elderly Mode"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-success border-2 border-white flex items-center justify-center">
            <CheckIcon />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-8">
        <div className="px-6">

          <div className="flex justify-center mb-5">
            <span className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full">
              What changes?
            </span>
          </div>

          <div className="bg-surface rounded-2xl p-4 mb-5 space-y-3">
            <ConsentCheckItem label="Larger text & simplified interface" />
            <ConsentCheckItem label="Guided actions (send money, pay bills)" />
            <ConsentCheckItem label="Optional family support access" />
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeMode}
                onChange={e => setAgreeMode(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded accent-[#7C3AED] flex-shrink-0 cursor-pointer"
              />
              <span className="text-sm text-foreground leading-relaxed">
                I understand and agree to enable Elderly mode
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeShare}
                onChange={e => setAgreeShare(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded accent-[#7C3AED] flex-shrink-0 cursor-pointer"
              />
              <span className="text-sm text-foreground leading-relaxed">
                I agree to share selected information with trusted family members (optional)
              </span>
            </label>
          </div>

          <button
            onClick={() => router.push('/onboarding/family')}
            disabled={!agreeMode}
            className="w-full h-[52px] rounded-2xl bg-primary text-white font-semibold text-base disabled:opacity-40 active:bg-primary-dark transition-colors mb-3"
          >
            Continue
          </button>
          <button
            onClick={() => router.back()}
            className="w-full h-[52px] rounded-2xl border-2 border-primary text-primary font-semibold text-base active:bg-surface transition-colors"
          >
            Cancel
          </button>

        </div>
      </div>

    </div>
  )
}
