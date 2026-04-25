'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getOnboardingState } from '@/app/lib/onboarding-storage'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      const { complete } = getOnboardingState()
      router.replace(complete ? '/dashboard' : '/onboarding/consent')
    }, 2500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="flex flex-col flex-1 bg-primary items-center justify-center relative overflow-hidden">
      {/* Radial ring decorations */}
      <div className="absolute w-[420px] h-[420px] rounded-full border border-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Logo */}
      <Image
        src="/assets/my-wally-splash-screen-logo.png"
        alt="myWally logo"
        width={110}
        height={110}
        priority
        className="mb-5 drop-shadow-lg"
      />

      {/* Brand name */}
      <p className="text-white text-3xl tracking-tight">
        <span className="font-light">my</span>
        <span className="font-bold">Wally</span>
      </p>
    </div>
  )
}
