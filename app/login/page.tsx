'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { clearAuth } from '@/app/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  function handleStartOver() {
    clearAuth()
    router.replace('/onboarding/consent')
  }

  return (
    <div className="flex flex-col flex-1 bg-surface">

      <div className="bg-primary text-center px-6 pb-10 flex-shrink-0">
        <div className="h-11" />
        <Image
          src="/assets/my-wally-splash-screen-logo.png"
          alt="myWally"
          width={64}
          height={64}
          className="mx-auto mb-3"
        />
        <p className="text-white text-2xl">
          <span className="font-light">my</span>
          <span className="font-bold">Wally</span>
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <p className="text-foreground font-bold text-xl mb-2">Session Expired</p>
          <p className="text-muted text-sm leading-relaxed">Your session has ended. Please start a new session to continue.</p>
        </div>

        <button
          onClick={handleStartOver}
          className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:bg-primary-dark transition-colors"
        >
          Start New Session
        </button>
      </div>

    </div>
  )
}
