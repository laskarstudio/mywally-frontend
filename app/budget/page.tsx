'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import StatusBar from '@/app/components/status-bar'
import BottomNav from '@/app/components/bottom-nav'

type Period = 'Daily' | 'Weekly' | 'Monthly'

export default function BudgetPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('100.00')
  const [period, setPeriod] = useState<Period>('Daily')
  const [threshold, setThreshold] = useState(80)

  function handleSave() {
    router.push('/dashboard')
  }

  const thresholdSteps = [20, 40, 60, 80, 100]

  return (
    <div className="flex flex-col flex-1">

      {/* Orange header */}
      <div className="bg-accent flex-shrink-0 relative overflow-hidden">
        <StatusBar variant="light" />
        <div className="flex items-end justify-between px-5 pb-6 mt-2">
          <h1 className="text-white font-bold text-4xl leading-tight">
            Set Daily<br />Budget
          </h1>
          <Image
            src="/assets/my-wally-daily-budget.png"
            alt="Wally"
            width={110}
            height={110}
            className="object-contain"
          />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-surface px-4 py-5 space-y-6 pb-8">

        {/* 1. Budget Amount */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold">1</span>
            <p className="font-bold text-foreground">Daily Budget Amount</p>
          </div>
          <div className="bg-white rounded-2xl flex items-center px-4 py-4 shadow-sm border border-border">
            <span className="text-foreground font-semibold text-base mr-3">RM</span>
            <div className="w-px h-5 bg-border mr-3" />
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 text-foreground font-semibold text-base outline-none bg-transparent"
            />
          </div>
        </div>

        {/* 2. Budget Period */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold">2</span>
            <p className="font-bold text-foreground">Budget Period</p>
          </div>
          <div className="bg-white rounded-2xl flex p-1 shadow-sm">
            {(['Daily', 'Weekly', 'Monthly'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${period === p ? 'bg-primary text-white' : 'text-muted'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Warning Threshold */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold">3</span>
            <p className="font-bold text-foreground">Warning Threshold</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <input
              type="range"
              min={20}
              max={100}
              step={20}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between mt-2">
              {thresholdSteps.map(s => (
                <span key={s} className={`text-xs font-medium ${s === threshold ? 'text-primary' : 'text-muted'}`}>
                  {s}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-purple-50 rounded-2xl p-4">
          <p className="text-sm text-foreground text-center leading-relaxed">
            <span className="text-primary font-semibold">Note:</span>{' '}
            You can adjust these settings anytime from your profile
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:bg-primary-dark transition-colors"
        >
          Save Budget
        </button>

      </div>

      <BottomNav />
    </div>
  )
}
