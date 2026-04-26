'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import StatusBar from '@/app/components/status-bar'
import { useInitiateTransfer } from '@/app/lib/hooks/useSendMoney'

function ProcessingContent() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const method      = searchParams.get('method') ?? 'bank'
  const initiated   = useRef(false)
  const navigated   = useRef(false)
  const [secondsLeft, setSecondsLeft] = useState(120)

  const { mutate: initiateTransfer } = useInitiateTransfer()

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    initiateTransfer(
      { method, amount: '500.00', recipient: 'Ahmad Ali' },
      {
        onSuccess: (data) => {
          if (navigated.current) return
          navigated.current = true
          router.replace(data.status === 'approved' ? '/send-money/approved' : '/send-money/declined')
        },
      },
    )
  }, [method, initiateTransfer, router])

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(id)
          if (!navigated.current) {
            navigated.current = true
            router.replace('/send-money/declined?reason=timeout')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [router])

  return (
    <div className="flex flex-col flex-1 bg-primary items-center justify-between py-0">

      <div className="w-full flex-shrink-0">
        <StatusBar variant="light" />
      </div>

      <div className="flex flex-col items-center flex-1 justify-center px-8 gap-8">

        <h1 className="text-white font-bold text-3xl text-center leading-snug">
          Transaction<br />In Progress...
        </h1>

        <div className="relative flex items-center justify-center">
          <div className="absolute w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute w-48 h-48 rounded-full border border-white/15" />
          <div className="absolute w-36 h-36 rounded-full bg-white/10" />
          <Image
            src="/assets/my-wally-money.png"
            alt="Wally processing"
            width={140}
            height={140}
            className="object-contain relative z-10"
          />
        </div>

        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg leading-snug">
            We&apos;re checking this transaction for your safety
          </p>
          <p className="text-white/60 text-sm">Please wait a moment</p>
          <p className="text-white/80 text-sm font-semibold tabular-nums">
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} remaining
          </p>
        </div>

        <div className="flex gap-3">
          <span className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
          <span className="w-3 h-3 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
          <span className="w-3 h-3 rounded-full bg-accent animate-bounce" />
        </div>

      </div>

      <div className="h-8 flex-shrink-0" />
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense>
      <ProcessingContent />
    </Suspense>
  )
}
