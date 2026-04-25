'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import StatusBar from '@/app/components/status-bar'

function DeclinedBadge() {
  return (
    <div className="w-14 h-14 rounded-full bg-danger border-4 border-white flex items-center justify-center shadow-md">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function HeartShieldIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  )
}

export default function DeclinedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-1 bg-white">

      {/* Orange curved header */}
      <div className="bg-accent rounded-b-[40px] flex-shrink-0 pb-10">
        <StatusBar variant="light" />
        <div className="px-6 pt-4 text-center">
          <h1 className="text-white font-bold text-3xl leading-snug mb-3">
            We&apos;ve paused<br />this for your safety
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Your family member is helping to<br />review this transaction
          </p>
        </div>
      </div>

      {/* Wally illustration — straddles the curved boundary */}
      <div className="flex-shrink-0 flex justify-center -mt-16 mb-6 relative z-10">
        <div className="relative">
          <Image
            src="/assets/my-wally-help.png"
            alt="Transaction declined"
            width={160}
            height={160}
            className="object-contain"
          />
          <div className="absolute bottom-0 right-0">
            <DeclinedBadge />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-6 pb-10 gap-5">

        {/* Info card */}
        <div className="bg-orange-50 rounded-2xl px-5 py-4 flex items-center gap-4">
          <HeartShieldIcon />
          <p className="text-foreground font-bold text-base leading-snug flex-1">
            This is to protect you from possible scam and fraud
          </p>
        </div>

        {/* Spacer pushes buttons down */}
        <div className="flex-1" />

        {/* CTAs */}
        <button
          onClick={() => router.replace('/dashboard')}
          className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:opacity-80 transition-opacity"
        >
          Call Family
        </button>
        <button
          onClick={() => router.replace('/send-money')}
          className="w-full h-[52px] rounded-2xl border-2 border-primary text-primary font-bold text-base active:bg-surface transition-colors"
        >
          Try Again Later
        </button>

      </div>

    </div>
  )
}
