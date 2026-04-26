'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { isAuthenticated } from '@/app/lib/auth'

export default function SplashScreen() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(isAuthenticated() ? '/dashboard' : '/onboarding/consent')
    }, 2500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="flex flex-col flex-1 bg-primary items-center justify-center relative overflow-hidden">
      <div className="absolute w-[420px] h-[420px] rounded-full border border-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <Image
        src="/assets/my-wally-logo.png"
        alt="myWally"
        width={140}
        height={140}
        priority
        className="drop-shadow-lg"
      />
    </div>
  )
}
